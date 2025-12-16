import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getIntegrationConfig, logIntegrationAction } from '@/lib/integrations-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// Mapear prioridad a Jira
function mapPriority(priority: string): string {
  switch (priority) {
    case 'Alta': return 'High';
    case 'Media': return 'Medium';
    case 'Baja': return 'Low';
    default: return 'Medium';
  }
}

// POST - Enviar casos de prueba a Jira
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

    // Obtener configuración de Jira
    const config = await getIntegrationConfig(user.id, 'jira');
    if (!config) {
      return NextResponse.json({ error: 'Jira no está configurado' }, { status: 400 });
    }

    const { domain, email, apiToken, projectKey } = config.config;

    // Autenticación básica para Jira
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    const results = [];
    const errors = [];

    for (const tc of testCases) {
      try {
        // Crear issue en Jira
        const response = await fetch(`https://${domain}/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              project: { key: projectKey },
              summary: `[TC-${tc.type}] ${tc.title}`,
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Precondiciones' }]
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: tc.preconditions || 'Ninguna' }]
                  },
                  {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Pasos' }]
                  },
                  {
                    type: 'orderedList',
                    content: tc.steps.map(step => ({
                      type: 'listItem',
                      content: [{
                        type: 'paragraph',
                        content: [{ type: 'text', text: step }]
                      }]
                    }))
                  },
                  {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'Resultado Esperado' }]
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: tc.expectedResult }]
                  }
                ]
              },
              issuetype: { name: 'Task' }, // O 'Test' si tienen Zephyr/Xray
              priority: { name: mapPriority(tc.priority) },
              labels: ['testcraft', tc.type.toLowerCase()],
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            testCaseId: tc.id,
            jiraKey: data.key,
            url: `https://${domain}/browse/${data.key}`
          });
        } else {
          const errorData = await response.json();
          errors.push({
            testCaseId: tc.id,
            error: errorData.errors || errorData.errorMessages || 'Error desconocido'
          });
        }
      } catch (error) {
        errors.push({
          testCaseId: tc.id,
          error: error instanceof Error ? error.message : 'Error de conexión'
        });
      }
    }

    // Log de la acción
    await logIntegrationAction(user.id, 'jira', 'send', errors.length === 0 ? 'success' : 'error', {
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
    console.error('Error sending to Jira:', error);
    return NextResponse.json({ error: 'Error al enviar a Jira' }, { status: 500 });
  }
}

// GET - Probar conexión con Jira
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getIntegrationConfig(user.id, 'jira');
    if (!config) {
      return NextResponse.json({ error: 'Jira no está configurado' }, { status: 400 });
    }

    const { domain, email, apiToken, projectKey } = config.config;
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    // Verificar conexión obteniendo info del proyecto
    const response = await fetch(`https://${domain}/rest/api/3/project/${projectKey}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const project = await response.json();
      await logIntegrationAction(user.id, 'jira', 'test', 'success');
      return NextResponse.json({
        success: true,
        project: {
          key: project.key,
          name: project.name,
        }
      });
    } else {
      await logIntegrationAction(user.id, 'jira', 'test', 'error');
      return NextResponse.json({ error: 'Credenciales inválidas o proyecto no encontrado' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}
