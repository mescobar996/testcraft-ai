import Stripe from 'stripe';

// Inicializar Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Definir planes
export type PlanId = 'free' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceId: string | null;
  features: string[];
  limits: {
    generationsPerDay: number;
    historyDays: number;
    exportFormats: string[];
    integrations: boolean;
    imageGeneration: boolean;
    testPlans: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 generaciones por dia',
      'Exportar a texto',
      'Historial 7 dias',
    ],
    limits: {
      generationsPerDay: 3,
      historyDays: 7,
      exportFormats: ['text', 'markdown'],
      integrations: false,
      imageGeneration: false,
      testPlans: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 5,
    priceId: process.env.STRIPE_PRICE_ID || null,
    features: [
      'Generaciones ilimitadas',
      'Generacion desde imagen',
      'Exportar a Excel, PDF, Gherkin',
      'Historial completo',
      'Prioridad en generacion',
      'Soporte prioritario',
    ],
    limits: {
      generationsPerDay: -1,
      historyDays: -1,
      exportFormats: ['text', 'markdown', 'excel', 'pdf', 'gherkin'],
      integrations: false,
      imageGeneration: true,
      testPlans: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    features: [
      'Todo de Pro',
      'Integracion Jira/TestRail',
      'API dedicada',
      'Soporte 24/7',
      'Usuarios ilimitados',
    ],
    limits: {
      generationsPerDay: -1,
      historyDays: -1,
      exportFormats: ['text', 'markdown', 'excel', 'pdf', 'gherkin', 'json'],
      integrations: true,
      imageGeneration: true,
      testPlans: true,
    },
  },
};

export function canUseFeature(
  userTier: PlanId | string | undefined,
  feature: keyof Plan['limits']
): boolean {
  const tier = (userTier as PlanId) || 'free';
  const plan = PLANS[tier] || PLANS.free;
  
  const value = plan.limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

export function getGenerationLimit(userTier: PlanId | string | undefined): number {
  const tier = (userTier as PlanId) || 'free';
  const plan = PLANS[tier] || PLANS.free;
  return plan.limits.generationsPerDay;
}

export function canGenerate(
  userTier: PlanId | string | undefined,
  currentCount: number
): boolean {
  const limit = getGenerationLimit(userTier);
  if (limit === -1) return true;
  return currentCount < limit;
}

export function getPlan(planId: PlanId | string): Plan {
  return PLANS[planId as PlanId] || PLANS.free;
}
