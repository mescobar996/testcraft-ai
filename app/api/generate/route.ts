import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Esquema de validación con Zod
const GenerateRequestSchema = z.object({
  requirement: z
    .string()
    .min(10, "El requisito debe tener al menos 10 caracteres")
    .max(5000, "El requisito no puede exceder 5000 caracteres")
    .trim(),
  context: z
    .string()
    .max(2000, "El contexto no puede exceder 2000 caracteres")
    .optional()
    .transform(val => val?.trim()),
  format: z
    .enum(["table", "gherkin", "both"])
    .optional()
    .default("table"),
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
  "gherkin": "Feature: ...\nScenario: ...\nGiven...\nWhen...\nThen...",
  "summary": "Resumen breve de la cobertura generada"
}`;

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier);

    if (!rateLimitResult.success) {
      const resetDate = rateLimitResult.resetTime 
        ? new Date(rateLimitResult.resetTime).toISOString()
        : null;
        
      return NextResponse.json(
        { 
          error: "Has excedido el límite de requests. Por favor, intenta más tarde.",
          retryAfter: resetDate
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Window': '15 minutes',
            ...(resetDate && { 'Retry-After': resetDate })
          }
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Validar con Zod
    const validationResult = GenerateRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { 
          error: "Datos de entrada inválidos",
          details: errors 
        },
        { status: 400 }
      );
    }

    const { requirement, context, format } = validationResult.data;

    const userMessage = `
REQUISITO/HISTORIA DE USUARIO:
${requirement}

${context ? `CONTEXTO ADICIONAL:\n${context}` : ""}

Genera casos de prueba completos para este requisito. Incluye casos positivos, negativos y de borde.
Responde SOLO con el JSON, sin texto adicional ni markdown.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No se recibió respuesta de texto");
    }

    // Parse JSON response
    let jsonResponse;
    try {
      // Clean the response in case it has markdown code blocks
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
      console.error("Error parsing JSON:", textContent.text);
      return NextResponse.json(
        { 
          error: "Error al procesar la respuesta de la IA",
          details: "La respuesta no es un JSON válido"
        },
        { status: 502 }
      );
    }

    // Validar que la respuesta tiene la estructura esperada
    if (!jsonResponse.testCases || !Array.isArray(jsonResponse.testCases)) {
      return NextResponse.json(
        { 
          error: "Respuesta de IA inválida",
          details: "No se encontraron casos de prueba en la respuesta"
        },
        { status: 502 }
      );
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in generate API:", error);
    
    // Manejo de errores específicos
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { 
            error: "Error de configuración del servicio de IA",
            details: "Por favor, contacta al soporte técnico"
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { 
            error: "Límite de uso excedido",
            details: "El servicio de IA está sobrecargado. Intenta más tarde."
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}