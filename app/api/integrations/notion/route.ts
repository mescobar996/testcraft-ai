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

// POST - Crear páginas en base de datos de Notion
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

    const config = await getIntegrationConfig(user.id, 'notion');
    if (!config) {
      return NextResponse.json({ error: 'Notion no está configurado' }, { status: 400 });
    }

    const { apiKey, databaseId } = config.config;

    const results = [];
    const errors = [];

    for (const tc of testCases) {
      try {
        const response = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            parent: { database_id: databaseId },
            properties: {
              // Asumiendo propiedades comunes en una DB de test cases
              'Name': {
                title: [{ text: { content: tc.title } }]
              },
              'ID': {
                rich_text: [{ text: { content: tc.id } }]
              },
              'Type': {
                select: { name: tc.type }
              },
              'Priority': {
                select: { name: tc.priority }
              },
              'Status': {
                select: { name: 'Pendiente' }
              },
            },
            children: [
              {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                  rich_text: [{ text: { content: 'Precondiciones' } }]
                }
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ text: { content: tc.preconditions || 'Ninguna' } }]
                }
              },
              {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                  rich_text: [{ text: { content: 'Pasos' } }]
                }
              },
              {
                object: 'block',
                type: 'numbered_list_item',
                numbered_list_item: {
                  rich_text: [{ text: { content: tc.steps[0] || '' } }]
                }
              },
              ...tc.steps.slice(1).map(step => ({
                object: 'block',
                type: 'numbered_list_item',
                numbered_list_item: {
                  rich_text: [{ text: { content: step } }]
                }
              })),
              {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                  rich_text: [{ text: { content: 'Resultado Esperado' } }]
                }
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ text: { content: tc.expectedResult } }]
                }
              },
            ]
          })
        });

        if (response.ok) {
          const page = await response.json();
          results.push({
            testCaseId: tc.id,
            pageId: page.id,
            url: page.url
          });
        } else {
          const error = await response.json();
          errors.push({
            testCaseId: tc.id,
            error: error.message || 'Error desconocido'
          });
        }
      } catch (error) {
        errors.push({
          testCaseId: tc.id,
          error: error instanceof Error ? error.message : 'Error'
        });
      }
    }

    await logIntegrationAction(user.id, 'notion', 'send', errors.length === 0 ? 'success' : 'error', {
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
    return NextResponse.json({ error: 'Error al enviar a Notion' }, { status: 500 });
  }
}

// GET - Probar conexión
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getIntegrationConfig(user.id, 'notion');
    if (!config) {
      return NextResponse.json({ error: 'Notion no está configurado' }, { status: 400 });
    }

    const { apiKey, databaseId } = config.config;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        }
      }
    );

    if (response.ok) {
      const db = await response.json();
      await logIntegrationAction(user.id, 'notion', 'test', 'success');
      return NextResponse.json({
        success: true,
        database: {
          title: db.title?.[0]?.plain_text || 'Sin nombre',
        }
      });
    } else {
      await logIntegrationAction(user.id, 'notion', 'test', 'error');
      return NextResponse.json({ error: 'Token inválido o DB no encontrada' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}
