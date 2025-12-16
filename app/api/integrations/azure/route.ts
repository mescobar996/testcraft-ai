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

function mapPriority(priority: string): number {
  switch (priority) {
    case 'Alta': return 1;
    case 'Media': return 2;
    case 'Baja': return 3;
    default: return 2;
  }
}

// POST - Crear work items en Azure DevOps
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

    const config = await getIntegrationConfig(user.id, 'azure');
    if (!config) {
      return NextResponse.json({ error: 'Azure DevOps no está configurado' }, { status: 400 });
    }

    const { organization, project, pat } = config.config;
    const auth = Buffer.from(`:${pat}`).toString('base64');

    const results = [];
    const errors = [];

    for (const tc of testCases) {
      try {
        // Formatear pasos para Azure Test Case
        const stepsHtml = `<steps>
          ${tc.steps.map((step, i) => `
            <step id="${i + 1}" type="ActionStep">
              <parameterizedString isformatted="true">${step}</parameterizedString>
              <parameterizedString isformatted="true">${i === tc.steps.length - 1 ? tc.expectedResult : 'Continuar'}</parameterizedString>
            </step>
          `).join('')}
        </steps>`;

        const response = await fetch(
          `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$Test Case?api-version=7.0`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json-patch+json',
            },
            body: JSON.stringify([
              {
                op: 'add',
                path: '/fields/System.Title',
                value: `[${tc.type}] ${tc.title}`
              },
              {
                op: 'add',
                path: '/fields/Microsoft.VSTS.Common.Priority',
                value: mapPriority(tc.priority)
              },
              {
                op: 'add',
                path: '/fields/Microsoft.VSTS.TCM.Steps',
                value: stepsHtml
              },
              {
                op: 'add',
                path: '/fields/System.Description',
                value: `<b>Precondiciones:</b><br>${tc.preconditions || 'Ninguna'}<br><br><b>Generado con TestCraft AI</b>`
              },
              {
                op: 'add',
                path: '/fields/System.Tags',
                value: `testcraft; ${tc.type}; ${tc.priority}`
              }
            ])
          }
        );

        if (response.ok) {
          const workItem = await response.json();
          results.push({
            testCaseId: tc.id,
            workItemId: workItem.id,
            url: workItem._links?.html?.href || `https://dev.azure.com/${organization}/${project}/_workitems/edit/${workItem.id}`
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

    await logIntegrationAction(user.id, 'azure', 'send', errors.length === 0 ? 'success' : 'error', {
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
    return NextResponse.json({ error: 'Error al enviar a Azure DevOps' }, { status: 500 });
  }
}

// GET - Probar conexión
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getIntegrationConfig(user.id, 'azure');
    if (!config) {
      return NextResponse.json({ error: 'Azure DevOps no está configurado' }, { status: 400 });
    }

    const { organization, project, pat } = config.config;
    const auth = Buffer.from(`:${pat}`).toString('base64');

    const response = await fetch(
      `https://dev.azure.com/${organization}/_apis/projects/${project}?api-version=7.0`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        }
      }
    );

    if (response.ok) {
      const projectData = await response.json();
      await logIntegrationAction(user.id, 'azure', 'test', 'success');
      return NextResponse.json({
        success: true,
        project: {
          name: projectData.name,
          id: projectData.id,
        }
      });
    } else {
      await logIntegrationAction(user.id, 'azure', 'test', 'error');
      return NextResponse.json({ error: 'PAT inválido o proyecto no encontrado' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}
