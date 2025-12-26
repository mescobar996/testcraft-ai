import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  saveIntegrationConfig, 
  getUserIntegrations, 
  deleteIntegration 
} from '@/lib/integrations-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (e) {
    console.warn('Supabase auth unavailable:', e);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const integrations = await getUserIntegrations(user.id);

    const safeIntegrations = integrations.map(i => ({
      integration_id: i.integration_id,
      is_active: i.is_active,
      created_at: i.created_at,
      config: {
        domain: i.config.domain,
        email: i.config.email,
        projectKey: i.config.projectKey,
        boardId: i.config.boardId,
        owner: i.config.owner,
        repo: i.config.repo,
        organization: i.config.organization,
        project: i.config.project,
        channel: i.config.channel,
      }
    }));

    // Get Jira-specific data if configured
    const jiraIntegration = integrations.find(i => i.integration_id === 'jira');
    let jiraData = { configured: false, projects: [] };

    if (jiraIntegration && jiraIntegration.is_active) {
      try {
        const { domain, email, apiToken } = jiraIntegration.config;
        const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

        const projectsResponse = await fetch(`https://${domain}/rest/api/3/project`, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          }
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          jiraData = {
            configured: true,
            projects: projectsData.map((p: any) => ({
              key: p.key,
              name: p.name
            }))
          };
        }
      } catch (error) {
        console.error('Error fetching Jira projects:', error);
      }
    }

    return NextResponse.json({
      integrations: safeIntegrations,
      jira: jiraData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { integrationId, config } = await request.json();

    if (!integrationId || !config) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const success = await saveIntegrationConfig(user.id, integrationId, config);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const success = await deleteIntegration(user.id, integrationId);

    return success 
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
