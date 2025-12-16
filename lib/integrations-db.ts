import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface IntegrationConfig {
  id: string;
  user_id: string;
  integration_id: string;
  config: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function saveIntegrationConfig(
  userId: string,
  integrationId: string,
  config: Record<string, string>
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_id: integrationId,
        config: config,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,integration_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving integration config:', error);
    return false;
  }
}

export async function getIntegrationConfig(
  userId: string,
  integrationId: string
): Promise<IntegrationConfig | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_id', integrationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
}

export async function getUserIntegrations(userId: string): Promise<IntegrationConfig[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting integrations:', error);
    return [];
  }
}

export async function deleteIntegration(
  userId: string,
  integrationId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('user_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('integration_id', integrationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting integration:', error);
    return false;
  }
}

export async function logIntegrationAction(
  userId: string,
  integrationId: string,
  action: 'send' | 'test' | 'connect' | 'disconnect',
  status: 'success' | 'error',
  details?: Record<string, any>
): Promise<void> {
  try {
    await supabaseAdmin
      .from('integration_logs')
      .insert({
        user_id: userId,
        integration_id: integrationId,
        action,
        status,
        details,
      });
  } catch (error) {
    console.error('Error logging integration action:', error);
  }
}
