import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  headers: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  last_triggered_at: string | null;
  last_status_code: number | null;
  total_deliveries: number;
  failed_deliveries: number;
  created_at: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: {
    requirement: string;
    context?: string;
    testCases: Array<{
      id: string;
      title: string;
      preconditions: string;
      steps: string[];
      expectedResult: string;
      priority: string;
      type: string;
    }>;
    gherkin: string;
    summary: string;
  };
}

// Generate webhook secret
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create HMAC signature for webhook payload
export function createWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Create a new webhook
export async function createWebhook(
  userId: string,
  name: string,
  url: string,
  events: string[] = ['generation.completed']
): Promise<Webhook | null> {
  const secret = generateWebhookSecret();
  
  const { data, error } = await supabaseAdmin
    .from('webhooks')
    .insert({
      user_id: userId,
      name,
      url,
      secret,
      events,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating webhook:', error);
    return null;
  }

  return data;
}

// Get user's webhooks
export async function getUserWebhooks(userId: string): Promise<Webhook[]> {
  const { data, error } = await supabaseAdmin
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching webhooks:', error);
    return [];
  }

  return data || [];
}

// Delete webhook
export async function deleteWebhook(userId: string, webhookId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('webhooks')
    .delete()
    .eq('id', webhookId)
    .eq('user_id', userId);

  return !error;
}

// Toggle webhook active status
export async function toggleWebhook(userId: string, webhookId: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('webhooks')
    .update({ is_active: isActive })
    .eq('id', webhookId)
    .eq('user_id', userId);

  return !error;
}

// Trigger webhooks for a user
export async function triggerWebhooks(
  userId: string,
  event: string,
  payload: WebhookPayload
): Promise<void> {
  // Get active webhooks for this user and event
  const { data: webhooks } = await supabaseAdmin
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [event]);

  if (!webhooks || webhooks.length === 0) return;

  // Send to each webhook
  for (const webhook of webhooks) {
    await sendWebhook(webhook, payload);
  }
}

// Send webhook with retries
async function sendWebhook(webhook: Webhook, payload: WebhookPayload): Promise<void> {
  const payloadString = JSON.stringify(payload);
  const signature = webhook.secret 
    ? createWebhookSignature(payloadString, webhook.secret)
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'TestCraft-Webhook/1.0',
    'X-TestCraft-Event': payload.event,
    'X-TestCraft-Delivery': crypto.randomUUID(),
    'X-TestCraft-Timestamp': payload.timestamp,
    ...webhook.headers,
  };

  if (signature) {
    headers['X-TestCraft-Signature'] = `sha256=${signature}`;
  }

  let lastError: string | null = null;
  let success = false;
  let statusCode: number | null = null;
  let responseBody: string | null = null;
  let responseTimeMs = 0;

  for (let attempt = 1; attempt <= webhook.retry_count; attempt++) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      responseTimeMs = Date.now() - startTime;
      statusCode = response.status;
      responseBody = await response.text().catch(() => null);

      if (response.ok) {
        success = true;
        break;
      } else {
        lastError = `HTTP ${response.status}: ${responseBody?.substring(0, 200)}`;
      }
    } catch (error) {
      responseTimeMs = Date.now() - startTime;
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Wait before retry (exponential backoff)
    if (attempt < webhook.retry_count) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // Log delivery
  await supabaseAdmin.from('webhook_deliveries').insert({
    webhook_id: webhook.id,
    event_type: payload.event,
    payload,
    response_status: statusCode,
    response_body: responseBody?.substring(0, 1000),
    response_time_ms: responseTimeMs,
    success,
    error_message: lastError,
  });

  // Update webhook stats
  await supabaseAdmin
    .from('webhooks')
    .update({
      last_triggered_at: new Date().toISOString(),
      last_status_code: statusCode,
      total_deliveries: webhook.total_deliveries + 1,
      failed_deliveries: success ? webhook.failed_deliveries : webhook.failed_deliveries + 1,
    })
    .eq('id', webhook.id);
}
