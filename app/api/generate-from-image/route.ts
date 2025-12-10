import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const context = formData.get("context") as string || "";
    const format = formData.get("format") as string || "both";

    if (!image) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    
    // Determine media type
    const mediaType = image.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mediaType)) {
      return NextResponse.json(
        { error: "Formato de imagen no soportado. Usa JPG, PNG, GIF o WebP." },
        { status: 400 }
      );
    }

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

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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

    // Parse JSON response
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
    } catch {
      console.error("Failed to parse response:", responseText);
      throw new Error("Error al procesar la respuesta de la IA");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating from image:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
