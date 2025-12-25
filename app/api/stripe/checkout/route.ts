import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS_SERVER } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

const CheckoutSchema = z.object({
  planId: z.enum(['PRO', 'ENTERPRISE'], {
    errorMap: () => ({ message: "Plan ID debe ser PRO o ENTERPRISE" })
  }),
  successUrl: z.string().url("URL de éxito inválida"),
  cancelUrl: z.string().url("URL de cancelación inválida"),
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Log detallado para debugging
    console.log('[CHECKOUT] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    })

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

    const { planId, successUrl, cancelUrl } = validationResult.data

    // Obtener el plan y su Price ID desde la versión del servidor
    const plan = PLANS_SERVER[planId]

    // Logging detallado para diagnóstico
    console.log('[CHECKOUT] Plan seleccionado:', {
      planId,
      planExists: !!plan,
      stripePriceId: plan?.stripePriceId,
      envVarName: planId === 'PRO' ? 'STRIPE_PRO_PRICE_ID' : 'STRIPE_ENTERPRISE_PRICE_ID',
      envVarValue: planId === 'PRO' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID,
    })

    if (!plan.stripePriceId) {
      console.error('[CHECKOUT] stripePriceId es null para plan:', planId)
      console.error('[CHECKOUT] Variable de entorno:', planId === 'PRO' ? process.env.STRIPE_PRO_PRICE_ID : process.env.STRIPE_ENTERPRISE_PRICE_ID)

      return NextResponse.json(
        {
          error: "Payment configuration error",
          debug: process.env.NODE_ENV === 'development' ? {
            planId,
            message: `La variable de entorno ${planId === 'PRO' ? 'STRIPE_PRO_PRICE_ID' : 'STRIPE_ENTERPRISE_PRICE_ID'} no está configurada`,
            stripePriceId: plan.stripePriceId,
          } : undefined
        },
        { status: 500 }
      )
    }

    const priceId = plan.stripePriceId

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