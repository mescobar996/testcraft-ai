import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createWebhook, getUserWebhooks, deleteWebhook, toggleWebhook } from '@/lib/webhooks';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Get authenticated user from request
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  
  return user;
}

// GET - List user's webhooks
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const webhooks = await getUserWebhooks(user.id);
  
  return NextResponse.json({ webhooks });
}

// POST - Create new webhook
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, url, events } = body;

  if (!name || !url) {
    return NextResponse.json(
      { error: 'name and url fields are required' },
      { status: 400 }
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  const webhook = await createWebhook(user.id, name, url, events);
  
  if (!webhook) {
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Webhook created successfully',
    webhook,
  });
}

// DELETE - Delete webhook
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get('id');

  if (!webhookId) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  const success = await deleteWebhook(user.id, webhookId);
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Webhook deleted successfully' });
}

// PATCH - Toggle webhook
export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, is_active } = body;

  if (!id || typeof is_active !== 'boolean') {
    return NextResponse.json(
      { error: 'id and is_active fields are required' },
      { status: 400 }
    );
  }

  const success = await toggleWebhook(user.id, id, is_active);
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Webhook updated successfully' });
}
