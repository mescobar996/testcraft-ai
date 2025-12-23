import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10 // 10 requests por ventana
};

export function checkRateLimit(identifier: string): { success: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);

  if (!userLimit) {
    // Primera request
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    });
    return { success: true };
  }

  if (now > userLimit.resetTime) {
    // Ventana expiró, resetear
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    });
    return { success: true };
  }

  if (userLimit.count >= RATE_LIMIT_CONFIG.maxRequests) {
    // Límite excedido
    return { success: false, resetTime: userLimit.resetTime };
  }

  // Incrementar contador
  userLimit.count++;
  rateLimitStore.set(identifier, userLimit);
  return { success: true };
}

export function getClientIdentifier(request: NextRequest): string {
  // Intentar obtener IP real del cliente
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
  
  // Si el usuario está autenticado, usar su ID
  const userId = request.headers.get('x-user-id');
  
  return userId ? `user:${userId}` : `ip:${ip}`;
}

export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Limpiar cada hora
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);