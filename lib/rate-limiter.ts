/**
 * Rate Limiter simple basado en memoria
 * Para producción, considerar usar Redis o Vercel KV
 */

import { RATE_LIMITING } from './constants';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Map para almacenar intentos por IP/usuario
const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMITING.ANONYMOUS_REQUESTS_PER_HOUR
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Nueva ventana de tiempo
    const resetTime = now + RATE_LIMITING.WINDOW_MS;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // Ventana de tiempo activa
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Incrementar contador
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

export function getRateLimitIdentifier(ip: string | null, userId?: string): string {
  // Preferir userId si está disponible, sino usar IP
  return userId || `ip:${ip || 'unknown'}`;
}
