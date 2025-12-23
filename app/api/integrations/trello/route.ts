import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getIntegrationConfig, logIntegrationAction } from '@/lib/integrations-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface TestCase {
  id: string;
  title: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: "Alta" | "Media" | "Baja";
  type: "Positivo" | "Negativo" | "Borde";
}

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  if (!supabaseUrl || !supabaseAnonKey) return null;
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  } catch (e) {
    console.warn('Supabase auth unavailable:', e);
    return null;
  }
}

// Mapear prioridad a label de color
function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'Alta': return 'red';
    case 'Media': return 'yellow';
    case 'Baja': return 'green';
    default: return 'blue';
  }
}

// POST - Crear tarjetas en Trello
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { testCases } = await request.json() as { testCases: TestCase[] };

    if (!testCases || testCases.length === 0) {
      return NextResponse.json({ error: 'No hay casos de prueba' }, { status: 400 });
    }

    const config = await getIntegrationConfig(user.id, 'trello');
    if (!config) {
      return NextResponse.json({ error: 'Trello no está configurado' }, { status: 400 });
    }

    const { apiKey, token, listId } = config.config;

    const results = [];
    const errors = [];

    for (const tc of testCases) {
      try {
        // Formatear descripción
        const description = `**Tipo:** ${tc.type}
**Prioridad:** ${tc.priority}

## Precondiciones
${tc.preconditions || 'Ninguna'}

## Pasos
${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Resultado Esperado
${tc.expectedResult}

---
_Generado con TestCraft AI_`;

        // Crear tarjeta
        const response = await fetch(
          `https://api.trello.com/1/cards?key=${apiKey}&token=${token}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idList: listId,
              name: `[${tc.type}] ${tc.title}`,
              desc: description,
              pos: 'bottom',
            })
          }
        );

        if (response.ok) {
          const card = await response.json();
          
          // Agregar checklist con los pasos
          await fetch(
            `https://api.trello.com/1/checklists?key=${apiKey}&token=${token}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                idCard: card.id,
                name: 'Pasos de prueba'
              })
            }
          ).then(async (checklistRes) => {
            if (checklistRes.ok) {
              const checklist = await checklistRes.json();
              // Agregar cada paso como item
              for (const step of tc.steps) {
                await fetch(
                  `https://api.trello.com/1/checklists/${checklist.id}/checkItems?key=${apiKey}&token=${token}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: step })
                  }
                );
              }
            }
          });

          results.push({
            testCaseId: tc.id,
            cardId: card.id,
            url: card.shortUrl
          });
        } else {
          const error = await response.text();
          errors.push({ testCaseId: tc.id, error });
        }
      } catch (error) {
        errors.push({
          testCaseId: tc.id,
          error: error instanceof Error ? error.message : 'Error'
        });
      }
    }

    await logIntegrationAction(user.id, 'trello', 'send', errors.length === 0 ? 'success' : 'error', {
      total: testCases.length,
      success: results.length,
      failed: errors.length
    });

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: testCases.length,
        created: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al enviar a Trello' }, { status: 500 });
  }
}

// GET - Probar conexión y obtener boards/lists
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getIntegrationConfig(user.id, 'trello');
    if (!config) {
      return NextResponse.json({ error: 'Trello no está configurado' }, { status: 400 });
    }

    const { apiKey, token, boardId } = config.config;

    // Obtener info del board
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${apiKey}&token=${token}&lists=open`
    );

    if (response.ok) {
      const board = await response.json();
      await logIntegrationAction(user.id, 'trello', 'test', 'success');
      return NextResponse.json({
        success: true,
        board: {
          id: board.id,
          name: board.name,
          lists: board.lists?.map((l: any) => ({ id: l.id, name: l.name })) || []
        }
      });
    } else {
      await logIntegrationAction(user.id, 'trello', 'test', 'error');
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}
