import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createApiKey, getUserApiKeys, deleteApiKey, toggleApiKey } from '@/lib/api-keys';

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

// GET - List user's API keys
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await getUserApiKeys(user.id);
  
  return NextResponse.json({ keys });
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, permissions } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      { error: 'name field is required' },
      { status: 400 }
    );
  }

  const result = await createApiKey(user.id, name, permissions);
  
  if (!result) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }

  // Return the raw key only once - it cannot be retrieved later
  return NextResponse.json({
    message: 'API key created successfully. Save this key now - it cannot be shown again.',
    key: result.rawKey,
    apiKey: result.apiKey,
  });
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get('id');

  if (!keyId) {
    return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
  }

  const success = await deleteApiKey(user.id, keyId);
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }

  return NextResponse.json({ message: 'API key deleted successfully' });
}

// PATCH - Toggle API key
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

  const success = await toggleApiKey(user.id, id, is_active);
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }

  return NextResponse.json({ message: 'API key updated successfully' });
}
