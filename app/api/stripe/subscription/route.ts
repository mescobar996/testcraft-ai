import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscriptionData) return NextResponse.json({ subscription: null, isActive: false });

    if (!stripe) {
      console.warn('Stripe not configured. Returning subscription info from DB only.');
      return NextResponse.json({ subscription: subscriptionData, isActive: subscriptionData.status === 'active' });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id as string);

    // ✅ Forzamos el tipo para evitar el error de TypeScript
    const sub = subscription as any;

    return NextResponse.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        price_id: sub.items.data[0]?.price.id,
      },
      isActive: sub.status === 'active',
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}