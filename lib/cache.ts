/**
 * Sistema de caché simple basado en memoria
 * Para producción, migrar a Redis o Vercel KV
 */

import { CACHE } from './constants';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export async function getCachedGeneration(
  requirement: string,
  context: string
): Promise<unknown | null> {
  const key = `gen:${hashString(requirement + context)}`;
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export async function setCachedGeneration(
  requirement: string,
  context: string,
  result: unknown
): Promise<void> {
  const key = `gen:${hashString(requirement + context)}`;
  cache.set(key, {
    data: result,
    expiresAt: Date.now() + (CACHE.GENERATION_TTL * 1000),
  });
}

export async function clearCache(): Promise<void> {
  cache.clear();
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
