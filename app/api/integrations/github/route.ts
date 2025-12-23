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

// POST - Crear issues en GitHub
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

    const config = await getIntegrationConfig(user.id, 'github');
    if (!config) {
      return NextResponse.json({ error: 'GitHub no está configurado' }, { status: 400 });
    }

    const { token, owner, repo } = config.config;

    const results = [];
    const errors = [];

    for (const tc of testCases) {
      try {
        const body = `## Caso de Prueba: ${tc.id}

**Tipo:** ${tc.type}
**Prioridad:** ${tc.priority}

### Precondiciones
${tc.preconditions || 'Ninguna'}

### Pasos
${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Resultado Esperado
${tc.expectedResult}

---
_Generado automáticamente con [TestCraft AI](https://testcraft.ai)_`;

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `[Test Case] ${tc.title}`,
              body,
              labels: ['test-case', tc.type.toLowerCase(), `priority-${tc.priority.toLowerCase()}`],
            })
          }
        );

        if (response.ok) {
          const issue = await response.json();
          results.push({
            testCaseId: tc.id,
            issueNumber: issue.number,
            url: issue.html_url
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

    await logIntegrationAction(user.id, 'github', 'send', errors.length === 0 ? 'success' : 'error', {
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
    return NextResponse.json({ error: 'Error al enviar a GitHub' }, { status: 500 });
  }
}

// GET - Probar conexión
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getIntegrationConfig(user.id, 'github');
    if (!config) {
      return NextResponse.json({ error: 'GitHub no está configurado' }, { status: 400 });
    }

    const { token, owner, repo } = config.config;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
        }
      }
    );

    if (response.ok) {
      const repoData = await response.json();
      await logIntegrationAction(user.id, 'github', 'test', 'success');
      return NextResponse.json({
        success: true,
        repo: {
          name: repoData.full_name,
          private: repoData.private,
        }
      });
    } else {
      await logIntegrationAction(user.id, 'github', 'test', 'error');
      return NextResponse.json({ error: 'Token inválido o repo no encontrado' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}
