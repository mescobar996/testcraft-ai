import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    // Obtener información de suscripción
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    let subscriptionDetails = null

    if (userData.stripe_subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          userData.stripe_subscription_id
        )

        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          price_id: subscription.items.data[0]?.price.id,
        }
      } catch (stripeError) {
        console.error("Stripe error:", stripeError)
        // Continuar sin detalles de Stripe
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        tier: userData.subscription_tier,
        status: userData.subscription_status,
        stripe_customer_id: userData.stripe_customer_id,
        stripe_subscription_id: userData.stripe_subscription_id,
        details: subscriptionDetails,
      },
    })

  } catch (error) {
    console.error("Get subscription error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    // Obtener subscription ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No hay suscripción activa" },
        { status: 400 }
      )
    }

    // Cancelar suscripción en Stripe
    await stripe.subscriptions.update(userData.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({
      success: true,
      message: "Suscripción cancelada. Se mantendrá activa hasta el final del período.",
    })

  } catch (error) {
    console.error("Cancel subscription error:", error)
    return NextResponse.json(
      { error: "Error al cancelar la suscripción" },
      { status: 500 }
    )
  }
}