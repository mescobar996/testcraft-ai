import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

const CheckoutSchema = z.object({
  priceId: z.string().min(1, "Price ID requerido"),
  successUrl: z.string().url("URL de éxito inválida"),
  cancelUrl: z.string().url("URL de cancelación inválida"),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Validar datos
    const validationResult = CheckoutSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { error: "Datos inválidos", details: errors },
        { status: 400 }
      )
    }

    const { priceId, successUrl, cancelUrl } = validationResult.data

    // Verificar que el priceId existe
    const plan = Object.values(PLANS).find(p => p.stripePriceId === priceId)
    
    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      )
    }

    // Obtener o crear customer de Stripe
    const stripeClient = getStripe()
    if (!stripeClient) {
      return NextResponse.json(
        { error: 'Stripe configurado incorrectamente' },
        { status: 500 }
      )
    }

    let { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      // Crear nuevo customer
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.user_metadata?.name,
      })
      
      customerId = customer.id
      
      // Guardar customer ID en la base de datos
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Crear sesión de checkout
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error("Stripe checkout error:", error)
    
    if (error instanceof Error) {
      if (error.message.includes('price')) {
        return NextResponse.json(
          { error: "Price ID inválido" },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}