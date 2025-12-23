// TEMPORAL - Solo para verificar variables de entorno
// ELIMINAR después de verificar

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasProPriceId: !!process.env.STRIPE_PRO_PRICE_ID,
    hasEnterprisePriceId: !!process.env.STRIPE_ENTERPRISE_PRICE_ID,
    proPriceIdPrefix: process.env.STRIPE_PRO_PRICE_ID?.substring(0, 10) || 'NOT_SET',
    enterprisePriceIdPrefix: process.env.STRIPE_ENTERPRISE_PRICE_ID?.substring(0, 10) || 'NOT_SET',
  });
}
