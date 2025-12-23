import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { ANTHROPIC, ERROR_MESSAGES, VALIDATION, RATE_LIMITING } from "@/lib/constants";
import { logError, logger } from "@/lib/logger";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limiter";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      logger.warn('generate-from-image-api', 'Rate limit exceeded', {
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

    // 3. Obtener y validar formData
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const context = (formData.get("context") as string || "").trim();
    const format = (formData.get("format") as string || "both").trim();

    if (!image) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    // 4. Validar tamaño de imagen
    if (image.size > VALIDATION.MAX_IMAGE_SIZE_BYTES) {
      logger.warn('generate-from-image-api', 'Image too large', {
        size: image.size,
        maxSize: VALIDATION.MAX_IMAGE_SIZE_BYTES
      });
      return NextResponse.json(
        { error: ERROR_MESSAGES.IMAGE_TOO_LARGE },
        { status: 400 }
      );
    }

    // 5. Validar tipo de imagen
    const mediaType = image.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    if (!ANTHROPIC.SUPPORTED_IMAGE_TYPES.includes(mediaType)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_IMAGE_FORMAT },
        { status: 400 }
      );
    }

    // 6. Validar contexto si existe
    if (context && context.length > VALIDATION.MAX_CONTEXT_LENGTH) {
      return NextResponse.json(
        { error: `El contexto no puede exceder ${VALIDATION.MAX_CONTEXT_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    // 7. Convertir imagen a base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    logger.info('generate-from-image-api', 'Processing image', {
      imageSize: image.size,
      imageType: mediaType,
      hasContext: !!context,
      format
    });

    const systemPrompt = `Eres un experto en QA y testing de software. Tu tarea es analizar capturas de pantalla de interfaces de usuario y generar casos de prueba profesionales y completos.

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
  "summary": "Resumen de los casos generados",
  "uiElements": ["Lista de elementos UI detectados"]
}

Al analizar la imagen:
1. Identifica todos los elementos interactivos (botones, inputs, links, checkboxes, etc.)
2. Detecta formularios y sus validaciones probables
3. Identifica flujos de navegación
4. Considera estados de error y éxito
5. Piensa en casos de borde (campos vacíos, caracteres especiales, límites)

Genera entre 8-15 casos de prueba que incluyan:
- Casos positivos (flujo feliz)
- Casos negativos (validaciones, errores)
- Casos de borde (límites, valores extremos)
- Casos de usabilidad si aplica`;

    const userPrompt = `Analiza esta captura de pantalla de una interfaz de usuario y genera casos de prueba completos.

${context ? `CONTEXTO ADICIONAL:\n${context}\n\n` : ""}

Identifica:
1. Todos los elementos interactivos visibles
2. Posibles validaciones de formularios
3. Flujos de usuario
4. Estados de error potenciales

Formato de salida: ${format === "table" ? "Solo testCases" : format === "gherkin" ? "Solo gherkin" : "testCases y gherkin"}

Responde SOLO con el JSON, sin texto adicional.`;

    // 8. Llamar a Anthropic
    const message = await anthropic.messages.create({
      model: ANTHROPIC.MODEL,
      max_tokens: ANTHROPIC.MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // 9. Parsear respuesta JSON
    let result;
    try {
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.slice(7);
      }
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith("```")) {
        cleanJson = cleanJson.slice(0, -3);
      }
      result = JSON.parse(cleanJson.trim());
    } catch (parseError) {
      logError("generate-from-image-api", parseError, {
        responsePreview: responseText.substring(0, 200)
      });
      throw new Error("Error al procesar la respuesta de la IA");
    }

    logger.info('generate-from-image-api', 'Image analysis successful', {
      testCasesCount: result.testCases?.length || 0,
      uiElementsCount: result.uiElements?.length || 0
    });

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      }
    });

  } catch (error) {
    logError("generate-from-image-api", error);

    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERATION_FAILED },
      { status: 500 }
    );
  }
}
