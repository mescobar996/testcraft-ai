/**
 * Mercado Pago Integration for LATAM payments
 *
 * Este módulo maneja la integración con Mercado Pago para pagos en Latinoamérica.
 * Soporta: Argentina, Brasil, México, Chile, Colombia, Perú, Uruguay
 */

// Planes disponibles en Mercado Pago (espejo de Stripe)
export const MERCADOPAGO_PLANS = {
  PRO: {
    id: 'PRO' as const,
    name: 'Pro',
    price: 9.99, // USD - Mercado Pago convertirá a moneda local
    currency: 'USD', // Se puede cambiar a ARS, BRL, MXN, etc según país
    features: [
      '100 generaciones/mes',
      'Historial en la nube',
      'Exportar a múltiples formatos',
      'Soporte prioritario'
    ],
    // IDs de productos en Mercado Pago (se configurarán después)
    mercadopagoProductId: process.env.MERCADOPAGO_PRO_PRODUCT_ID || null,
  },
  ENTERPRISE: {
    id: 'ENTERPRISE' as const,
    name: 'Enterprise',
    price: 29.99,
    currency: 'USD',
    features: [
      'Generaciones ilimitadas',
      'Integraciones (Jira, Azure, GitHub)',
      'API access',
      'Soporte dedicado'
    ],
    mercadopagoProductId: process.env.MERCADOPAGO_ENTERPRISE_PRODUCT_ID || null,
  }
} as const;

export type MercadoPagoPlanId = keyof typeof MERCADOPAGO_PLANS;

// Países soportados por Mercado Pago
export const MERCADOPAGO_COUNTRIES = [
  'AR', // Argentina
  'BR', // Brasil
  'MX', // México
  'CL', // Chile
  'CO', // Colombia
  'PE', // Perú
  'UY', // Uruguay
] as const;

/**
 * Verifica si Mercado Pago está disponible en el país del usuario
 */
export function isMercadoPagoAvailable(countryCode?: string): boolean {
  if (!countryCode) return false;
  return MERCADOPAGO_COUNTRIES.includes(countryCode as any);
}

/**
 * Obtiene la moneda preferida según el país
 */
export function getPreferredCurrency(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    AR: 'ARS', // Peso argentino
    BR: 'BRL', // Real brasileño
    MX: 'MXN', // Peso mexicano
    CL: 'CLP', // Peso chileno
    CO: 'COP', // Peso colombiano
    PE: 'PEN', // Sol peruano
    UY: 'UYU', // Peso uruguayo
  };

  return currencyMap[countryCode] || 'USD';
}

/**
 * Verifica si Mercado Pago está configurado correctamente
 */
export function isMercadoPagoConfigured(): boolean {
  return !!(
    process.env.MERCADOPAGO_ACCESS_TOKEN &&
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
  );
}

/**
 * Nota: La implementación real de creación de preferencias y webhooks
 * se agregará en app/api/mercadopago/checkout/route.ts y webhook/route.ts
 *
 * Por ahora, esta es solo la configuración base.
 */
