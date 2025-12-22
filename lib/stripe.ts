import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
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
    stripePriceId: null,
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
      'Integración con Jira',
      'Soporte prioritario'
    ],
    maxUsage: 500,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'usd',
    features: [
      'Casos de prueba ilimitados',
      'Exportación completa + API',
      'Plantillas ilimitadas',
      'Historial ilimitado',
      'Integraciones múltiples (Jira, TestRail, etc.)',
      'Soporte 24/7',
      'SLA garantizado'
    ],
    maxUsage: -1, // -1 = ilimitado
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
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