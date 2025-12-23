import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return NextResponse.json({ 
        subscription: null,
        isActive: false 
      });
    }

    return NextResponse.json({
      subscription,
      isActive: subscription?.status === 'active'
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, status } = body;

    if (!plan_id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id,
        status: status || 'active',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating subscription:', error);
      return NextResponse.json({ 
        error: 'Failed to create subscription' 
      }, { status: 500 });
    }

    return NextResponse.json({
      subscription,
      message: 'Subscription created/updated successfully'
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to create subscription' 
    }, { status: 500 });
  }
}