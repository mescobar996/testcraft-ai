import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

const stripe = getStripe();

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json({ error: 'Stripe webhook secret not configured' }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      console.error('Supabase admin not configured');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const userId = session.client_reference_id;

        if (!userId) break;

        // ✅ Forzamos el tipo para evitar errores de TypeScript
        const sub = subscription as any;

        await supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          status: subscription.status,
          plan: priceId?.includes('pro') ? 'pro' : 'enterprise',
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
        });

        await supabase
          .from('users')
          .update({
            subscription_tier: priceId?.includes('pro') ? 'pro' : 'enterprise',
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', userId);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        const sub = subscription as any;

        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        await supabase
          .from('users')
          .update({ subscription_status: subscription.status })
          .eq('id', userId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('id', userId);

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}