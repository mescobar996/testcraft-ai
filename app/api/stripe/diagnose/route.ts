import { NextResponse } from 'next/server'
import { PLANS_SERVER } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Información de diagnóstico
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,

      // Verificar si las variables existen
      envVars: {
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        stripeSecretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'NOT_SET',

        hasProPriceId: !!process.env.STRIPE_PRO_PRICE_ID,
        proPriceIdValue: process.env.STRIPE_PRO_PRICE_ID || 'NOT_SET',

        hasEnterprisePriceId: !!process.env.STRIPE_ENTERPRISE_PRICE_ID,
        enterprisePriceIdValue: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'NOT_SET',
      },

      // Verificar PLANS_SERVER
      plansServer: {
        pro: {
          id: PLANS_SERVER.PRO.id,
          name: PLANS_SERVER.PRO.name,
          price: PLANS_SERVER.PRO.price,
          hasStripePriceId: !!PLANS_SERVER.PRO.stripePriceId,
          stripePriceIdValue: PLANS_SERVER.PRO.stripePriceId || 'NULL',
        },
        enterprise: {
          id: PLANS_SERVER.ENTERPRISE.id,
          name: PLANS_SERVER.ENTERPRISE.name,
          price: PLANS_SERVER.ENTERPRISE.price,
          hasStripePriceId: !!PLANS_SERVER.ENTERPRISE.stripePriceId,
          stripePriceIdValue: PLANS_SERVER.ENTERPRISE.stripePriceId || 'NULL',
        }
      },

      // Verificar todas las variables de entorno relacionadas
      allEnvKeys: Object.keys(process.env)
        .filter(key => key.includes('STRIPE') || key.includes('NEXT_PUBLIC'))
        .sort(),
    }

    return NextResponse.json(diagnosis, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: 'Error en diagnóstico',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
