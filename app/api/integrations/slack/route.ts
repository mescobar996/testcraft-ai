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

// POST - Enviar notificación a Slack
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { testCases, requirementTitle } = await request.json() as { 
      testCases: TestCase[]; 
      requirementTitle?: string;
    };

    if (!testCases || testCases.length === 0) {
      return NextResponse.json({ error: 'No hay casos de prueba' }, { status: 400 });
    }

    const config = await getIntegrationConfig(user.id, 'slack');
    if (!config) {
      return NextResponse.json({ error: 'Slack no está configurado' }, { status: 400 });
    }

    const { webhookUrl } = config.config;

    // Contar por tipo
    const stats = {
      positivos: testCases.filter(tc => tc.type === 'Positivo').length,
      negativos: testCases.filter(tc => tc.type === 'Negativo').length,
      borde: testCases.filter(tc => tc.type === 'Borde').length,
    };

    // Crear mensaje de Slack con blocks
    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🧪 Nuevos Casos de Prueba Generados',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: requirementTitle 
              ? `*Requerimiento:* ${requirementTitle.substring(0, 100)}${requirementTitle.length > 100 ? '...' : ''}`
              : '*Casos de prueba generados con TestCraft AI*'
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*📊 Total:*\n${testCases.length} casos` },
            { type: 'mrkdwn', text: `*✅ Positivos:*\n${stats.positivos}` },
            { type: 'mrkdwn', text: `*❌ Negativos:*\n${stats.negativos}` },
            { type: 'mrkdwn', text: `*⚠️ Borde:*\n${stats.borde}` },
          ]
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Casos generados:*\n' + testCases.slice(0, 5).map(tc => 
              `• \`${tc.id}\` ${tc.title} _(${tc.type}, ${tc.priority})_`
            ).join('\n') + (testCases.length > 5 ? `\n_...y ${testCases.length - 5} más_` : '')
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Generado por *${user.email}* usando TestCraft AI • ${new Date().toLocaleString('es-AR')}`
            }
          ]
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      await logIntegrationAction(user.id, 'slack', 'send', 'success', {
        testCases: testCases.length
      });
      return NextResponse.json({ success: true });
    } else {
      await logIntegrationAction(user.id, 'slack', 'send', 'error');
      return NextResponse.json({ error: 'Error al enviar a Slack' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}

// GET - Probar webhook
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getIntegrationConfig(user.id, 'slack');
    if (!config) {
      return NextResponse.json({ error: 'Slack no está configurado' }, { status: 400 });
    }

    const { webhookUrl } = config.config;

    // Enviar mensaje de prueba
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '✅ Conexión exitosa con TestCraft AI'
      })
    });

    if (response.ok) {
      await logIntegrationAction(user.id, 'slack', 'test', 'success');
      return NextResponse.json({ success: true });
    } else {
      await logIntegrationAction(user.id, 'slack', 'test', 'error');
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error de conexión' }, { status: 500 });
  }
}
