import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for API operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  permissions: {
    generate: boolean;
    history: boolean;
  };
  rate_limit_per_hour: number;
  total_requests: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// Generate a secure API key
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32);
  const key = `tc_live_${randomBytes.toString('base64url')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 16) + '...';
  
  return { key, hash, prefix };
}

// Hash an API key for lookup
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Create a new API key
export async function createApiKey(
  userId: string,
  name: string,
  permissions?: { generate: boolean; history: boolean }
): Promise<{ apiKey: ApiKey; rawKey: string } | null> {
  const { key, hash, prefix } = generateApiKey();
  
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      key_hash: hash,
      key_prefix: prefix,
      permissions: permissions || { generate: true, history: false },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating API key:', error);
    return null;
  }

  return { apiKey: data, rawKey: key };
}

// Validate API key and return user info
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  apiKey?: ApiKey;
  error?: string;
}> {
  if (!key || !key.startsWith('tc_live_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const hash = hashApiKey(key);
  
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, error: 'API key not found or inactive' };
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Check rate limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { count } = await supabaseAdmin
    .from('api_requests')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', data.id)
    .gte('created_at', oneHourAgo);

  if (count && count >= data.rate_limit_per_hour) {
    return { valid: false, error: 'Rate limit exceeded. Try again later.' };
  }

  // Update last used
  await supabaseAdmin
    .from('api_keys')
    .update({ 
      last_used_at: new Date().toISOString(),
      total_requests: data.total_requests + 1
    })
    .eq('id', data.id);

  return { valid: true, apiKey: data };
}

// Log API request
export async function logApiRequest(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  ipAddress?: string,
  userAgent?: string,
  requestBody?: object,
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from('api_requests').insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
    ip_address: ipAddress,
    user_agent: userAgent,
    request_body: requestBody,
    error_message: errorMessage,
  });
}

// Get user's API keys
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching API keys:', error);
    return [];
  }

  return data || [];
}

// Delete API key
export async function deleteApiKey(userId: string, keyId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId);

  return !error;
}

// Toggle API key active status
export async function toggleApiKey(userId: string, keyId: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('api_keys')
    .update({ is_active: isActive })
    .eq('id', keyId)
    .eq('user_id', userId);

  return !error;
}
