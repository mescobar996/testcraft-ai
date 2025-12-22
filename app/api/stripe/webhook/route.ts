import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PLANS } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        const customerId = session.customer as string
        const sessionId = session.id
        
        // Actualizar usuario con suscripción
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userData) {
          await supabase
            .from('users')
            .update({
              subscription_tier: session.metadata?.planId || 'pro',
              subscription_status: 'active',
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userData.id)

          // Crear registro de suscripción
          await supabase
            .from('subscriptions')
            .insert({
              user_id: userData.id,
              stripe_subscription_id: session.subscription,
              stripe_customer_id: customerId,
              stripe_session_id: sessionId,
              plan_id: session.metadata?.planId || 'pro',
              status: 'active',
              current_period_start: new Date(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
              created_at: new Date().toISOString(),
            })
        }
        
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Actualizar fecha de período actual
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userData && invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({
              current_period_start: new Date(invoice.period_start * 1000),
              current_period_end: new Date(invoice.period_end * 1000),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userData.id)
            .eq('stripe_subscription_id', invoice.subscription)
        }
        
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Marcar suscripción como fallida
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userData) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userData.id)

          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userData.id)
            .eq('stripe_subscription_id', invoice.subscription)
        }
        
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Cancelar suscripción
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userData) {
          await supabase
            .from('users')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userData.id)

          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userData.id)
            .eq('stripe_subscription_id', subscription.id)
        }
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}