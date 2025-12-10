import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

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
    const { requirement, context } = await request.json();

    if (!requirement) {
      return NextResponse.json(
        { error: "El requisito es obligatorio" },
        { status: 400 }
      );
    }

    const userMessage = `
REQUISITO/HISTORIA DE USUARIO:
${requirement}

${context ? `CONTEXTO ADICIONAL:\n${context}` : ""}

Genera casos de prueba completos para este requisito. Incluye casos positivos, negativos y de borde.
Responde SOLO con el JSON, sin texto adicional ni markdown.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
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
    } catch {
      console.error("Error parsing JSON:", textContent.text);
      throw new Error("Error al procesar la respuesta de la IA");
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}
