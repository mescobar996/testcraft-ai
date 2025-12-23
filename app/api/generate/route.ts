import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { GenerateRequestSchema } from "@/lib/validations";
import { ANTHROPIC, ERROR_MESSAGES, RATE_LIMITING } from "@/lib/constants";
import { logError, logger } from "@/lib/logger";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limiter";
import { getCachedGeneration, setCachedGeneration } from "@/lib/cache";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Eres un experto QA Engineer con más de 10 años de experiencia en testing de software. Tu tarea es generar casos de prueba exhaustivos y profesionales a partir de requisitos o historias de usuario.

REGLAS IMPORTANTES:
1. Genera casos de prueba que cubran:
   - Flujos positivos (happy path)
   - Flujos negativos (manejo de errores)
   - Casos de borde (límites, valores extremos)
   - Casos de seguridad si aplica

2. Cada caso de prueba debe tener:
   - ID único (TC001, TC002, etc.)
   - Título descriptivo y conciso
   - Precondiciones claras
   - Pasos detallados y reproducibles
   - Resultado esperado específico
   - Prioridad (Alta, Media, Baja)
   - Tipo (Positivo, Negativo, Borde)

3. También genera la versión en formato Gherkin (Given/When/Then) de los casos más importantes.

4. Sé exhaustivo pero práctico. No generes casos redundantes.

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "testCases": [
    {
      "id": "TC001",
      "title": "string",
      "preconditions": "string",
      "steps": ["paso 1", "paso 2"],
      "expectedResult": "string",
      "priority": "Alta|Media|Baja",
      "type": "Positivo|Negativo|Borde"
    }
  ],
  "gherkin": "Feature: ...\\nScenario: ...\\nGiven...\\nWhen...\\nThen...",
  "summary": "Resumen breve de la cobertura generada"
}`;

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    // 2. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitId = getRateLimitIdentifier(ip, session?.user?.id);
    const maxRequests = session
      ? RATE_LIMITING.AUTHENTICATED_REQUESTS_PER_HOUR
      : RATE_LIMITING.ANONYMOUS_REQUESTS_PER_HOUR;

    const rateLimit = await checkRateLimit(rateLimitId, maxRequests);

    if (!rateLimit.allowed) {
      logger.warn('generate-api', 'Rate limit exceeded', {
        identifier: rateLimitId.substring(0, 20),
        maxRequests
      });
      return NextResponse.json(
        { error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    // 3. Validar entrada con Zod
    const body = await request.json();
    const validatedData = GenerateRequestSchema.parse(body);
    const { requirement, context, format } = validatedData;

    // 4. Verificar caché
    const cached = await getCachedGeneration(requirement, context);
    if (cached) {
      logger.info('generate-api', 'Cache hit', { requirementLength: requirement.length });
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      });
    }

    // 5. Generar con Anthropic
    const userMessage = `
REQUISITO/HISTORIA DE USUARIO:
${requirement}

${context ? `CONTEXTO ADICIONAL:\n${context}` : ""}

Genera casos de prueba completos para este requisito. Incluye casos positivos, negativos y de borde.
Responde SOLO con el JSON, sin texto adicional ni markdown.`;

    logger.info('generate-api', 'Calling Anthropic API', {
      requirementLength: requirement.length,
      hasContext: !!context,
      format
    });

    const response = await anthropic.messages.create({
      model: ANTHROPIC.MODEL,
      max_tokens: ANTHROPIC.MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // 6. Extraer y parsear respuesta
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No se recibió respuesta de texto");
    }

    let jsonResponse;
    try {
      // Limpiar respuesta de markdown
      let cleanedText = textContent.text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      jsonResponse = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      logError("generate-api", parseError, {
        responsePreview: textContent.text.substring(0, 200)
      });
      throw new Error("Error al procesar la respuesta de la IA");
    }

    // 7. Guardar en caché
    await setCachedGeneration(requirement, context, jsonResponse);

    logger.info('generate-api', 'Generation successful', {
      testCasesCount: jsonResponse.testCases?.length || 0
    });

    return NextResponse.json(jsonResponse, {
      headers: {
        'X-Cache': 'MISS',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      }
    });

  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.INVALID_INPUT,
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    logError("generate-api", error);

    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERATION_FAILED },
      { status: 500 }
    );
  }
}
