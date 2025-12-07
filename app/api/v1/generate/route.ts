import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { validateApiKey, logApiRequest } from '@/lib/api-keys';
import { triggerWebhooks } from '@/lib/webhooks';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// CORS headers for API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET - API documentation
export async function GET() {
  return NextResponse.json({
    name: 'TestCraft AI API',
    version: '1.0.0',
    documentation: 'https://testcraft-ai-five.vercel.app/api/docs',
    endpoints: {
      generate: {
        method: 'POST',
        path: '/api/v1/generate',
        description: 'Generate test cases from requirements',
        authentication: 'Bearer token or X-API-Key header',
        body: {
          requirement: 'string (required) - The requirement or user story',
          context: 'string (optional) - Additional context',
          format: 'string (optional) - "table", "gherkin", or "both" (default)',
        },
        response: {
          testCases: 'Array of test case objects',
          gherkin: 'Gherkin syntax string',
          summary: 'Summary of generated cases',
        },
      },
    },
    rateLimit: '100 requests per hour',
  }, { headers: corsHeaders });
}

// POST - Generate test cases
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let apiKeyId: string | null = null;
  
  try {
    // Extract API key from header
    const authHeader = request.headers.get('authorization');
    const xApiKey = request.headers.get('x-api-key');
    
    let apiKey = '';
    if (authHeader?.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    } else if (xApiKey) {
      apiKey = xApiKey;
    }

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Missing API key',
          message: 'Provide API key via Authorization: Bearer <key> or X-API-Key header'
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Validate API key
    const validation = await validateApiKey(apiKey);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: validation.error },
        { status: 401, headers: corsHeaders }
      );
    }

    apiKeyId = validation.apiKey!.id;

    // Check permissions
    if (!validation.apiKey!.permissions.generate) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'API key does not have generate permission' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { requirement, context = '', format = 'both' } = body;

    if (!requirement || typeof requirement !== 'string') {
      await logApiRequest(
        apiKeyId,
        '/api/v1/generate',
        'POST',
        400,
        Date.now() - startTime,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined,
        body,
        'Missing or invalid requirement'
      );

      return NextResponse.json(
        { error: 'Bad Request', message: 'requirement field is required and must be a string' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate test cases using Claude
    const systemPrompt = `Eres un experto en QA y testing de software. Tu tarea es generar casos de prueba profesionales y completos.

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones.

El JSON debe tener exactamente esta estructura:
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "Título descriptivo del caso",
      "preconditions": "Precondiciones necesarias",
      "steps": ["Paso 1", "Paso 2", "Paso 3"],
      "expectedResult": "Resultado esperado",
      "priority": "Alta|Media|Baja",
      "type": "Positivo|Negativo|Borde"
    }
  ],
  "gherkin": "Feature: ...\\nScenario: ...\\nGiven...\\nWhen...\\nThen...",
  "summary": "Resumen de los casos generados"
}

Genera entre 8-15 casos de prueba que incluyan:
- Casos positivos (flujo feliz)
- Casos negativos (validaciones, errores)
- Casos de borde (límites, valores extremos)

Prioridades:
- Alta: Funcionalidad crítica
- Media: Funcionalidad importante
- Baja: Funcionalidad secundaria`;

    const userPrompt = `Genera casos de prueba para el siguiente requisito:

REQUISITO:
${requirement}

${context ? `CONTEXTO ADICIONAL:\n${context}` : ''}

Formato de salida: ${format === 'table' ? 'Solo testCases' : format === 'gherkin' ? 'Solo gherkin' : 'testCases y gherkin'}

Responde SOLO con el JSON, sin texto adicional.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Parse JSON response
    let result;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.slice(7);
      }
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.slice(0, -3);
      }
      result = JSON.parse(cleanJson.trim());
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    const responseTimeMs = Date.now() - startTime;

    // Log successful request
    await logApiRequest(
      apiKeyId,
      '/api/v1/generate',
      'POST',
      200,
      responseTimeMs,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined,
      { requirement: requirement.substring(0, 100), format }
    );

    // Trigger webhooks
    await triggerWebhooks(validation.apiKey!.user_id, 'generation.completed', {
      event: 'generation.completed',
      timestamp: new Date().toISOString(),
      data: {
        requirement,
        context,
        testCases: result.testCases,
        gherkin: result.gherkin,
        summary: result.summary,
      },
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: responseTimeMs,
        testCaseCount: result.testCases?.length || 0,
      },
    }, { headers: corsHeaders });

  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (apiKeyId) {
      await logApiRequest(
        apiKeyId,
        '/api/v1/generate',
        'POST',
        500,
        responseTimeMs,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined,
        undefined,
        errorMessage
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}
