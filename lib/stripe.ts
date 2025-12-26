import Stripe from 'stripe'

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Definición base de planes (sin información sensible del servidor)
const PLANS_BASE = {
  FREE: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    currency: 'usd',
    features: [
      '10 casos de prueba por mes',
      'Exportación básica (Excel, PDF)',
      'Plantillas predefinidas',
      'Historial limitado (7 días)'
    ],
    maxUsage: 10,
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'usd',
    features: [
      '500 casos de prueba por mes',
      'Exportación completa (Excel, PDF, Gherkin)',
      'Plantillas personalizadas',
      'Historial completo',
      'Integración con Jira (próximamente)',
      'Soporte prioritario'
    ],
    maxUsage: 500,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'usd',
    features: [
      'Casos de prueba ilimitados',
      'Exportación completa + API (próximamente)',
      'Plantillas ilimitadas',
      'Historial ilimitado',
      'Integraciones múltiples (próximamente)',
      'Soporte 24/7',
      'SLA garantizado'
    ],
    maxUsage: -1, // -1 = ilimitado
  }
} as const

// Exportar versión pública para componentes cliente
export const PLANS = PLANS_BASE

// Versión completa con Price IDs para uso en servidor
export const PLANS_SERVER = {
  FREE: {
    ...PLANS_BASE.FREE,
    stripePriceId: null,
  },
  PRO: {
    ...PLANS_BASE.PRO,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
  },
  ENTERPRISE: {
    ...PLANS_BASE.ENTERPRISE,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
  }
} as const

export type PlanId = keyof typeof PLANS

export function getPlanById(id: string) {
  return PLANS[id as PlanId] || PLANS.FREE
}

export function canUseFeature(userTier: string, requiredTier: PlanId = 'FREE'): boolean {
  const planOrder = ['FREE', 'PRO', 'ENTERPRISE']
  const userIndex = planOrder.indexOf(userTier as PlanId)
  const requiredIndex = planOrder.indexOf(requiredTier)
  
  return userIndex >= requiredIndex
}