/**
 * Sistema de Analytics Personal
 * Rastrea métricas del usuario para mostrar valor y motivar upgrades
 */

const ANALYTICS_KEY = 'testcraft-user-analytics';

export interface UserAnalytics {
  userId: string | null;
  totalGenerations: number;
  generationsThisMonth: number;
  generationsLastMonth: number;
  firstGenerationDate: string | null;
  lastGenerationDate: string | null;
  favoriteCount: number;
  exportCount: number;
  imageUploadsCount: number;
  longestStreak: number;
  currentStreak: number;
  lastActiveDate: string | null;
  featuresUsed: {
    textGeneration: number;
    imageGeneration: number;
    pdfExport: number;
    excelExport: number;
    gherkinExport: number;
    favorites: number;
  };
}

/**
 * Obtiene las analytics de un usuario
 */
export function getUserAnalytics(userId: string | null): UserAnalytics {
  if (typeof window === 'undefined') {
    return getDefaultAnalytics(userId);
  }

  const key = userId ? `${ANALYTICS_KEY}-${userId}` : ANALYTICS_KEY;
  const saved = localStorage.getItem(key);

  if (!saved) {
    return getDefaultAnalytics(userId);
  }

  try {
    const analytics: UserAnalytics = JSON.parse(saved);

    // Calcular generaciones del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastGenDate = analytics.lastGenerationDate || '';
    const lastGenMonth = lastGenDate.slice(0, 7);

    // Si es un mes diferente, reiniciar contador mensual
    if (lastGenMonth !== currentMonth) {
      analytics.generationsLastMonth = analytics.generationsThisMonth;
      analytics.generationsThisMonth = 0;
    }

    return analytics;
  } catch {
    return getDefaultAnalytics(userId);
  }
}

function getDefaultAnalytics(userId: string | null): UserAnalytics {
  return {
    userId,
    totalGenerations: 0,
    generationsThisMonth: 0,
    generationsLastMonth: 0,
    firstGenerationDate: null,
    lastGenerationDate: null,
    favoriteCount: 0,
    exportCount: 0,
    imageUploadsCount: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastActiveDate: null,
    featuresUsed: {
      textGeneration: 0,
      imageGeneration: 0,
      pdfExport: 0,
      excelExport: 0,
      gherkinExport: 0,
      favorites: 0
    }
  };
}

/**
 * Registra una generación de casos de prueba
 */
export function trackGeneration(userId: string | null, fromImage: boolean = false): void {
  if (typeof window === 'undefined') return;

  const analytics = getUserAnalytics(userId);
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // Incrementar contadores
  analytics.totalGenerations++;
  analytics.generationsThisMonth++;
  analytics.lastGenerationDate = now;

  if (!analytics.firstGenerationDate) {
    analytics.firstGenerationDate = now;
  }

  // Trackear feature específica
  if (fromImage) {
    analytics.imageUploadsCount++;
    analytics.featuresUsed.imageGeneration++;
  } else {
    analytics.featuresUsed.textGeneration++;
  }

  // Calcular racha
  const lastActiveDay = analytics.lastActiveDate?.slice(0, 10);
  if (lastActiveDay) {
    const daysDiff = getDaysDifference(lastActiveDay, today);

    if (daysDiff === 0) {
      // Mismo día, no hacer nada
    } else if (daysDiff === 1) {
      // Día consecutivo, incrementar racha
      analytics.currentStreak++;
      if (analytics.currentStreak > analytics.longestStreak) {
        analytics.longestStreak = analytics.currentStreak;
      }
    } else {
      // Racha rota, reiniciar
      analytics.currentStreak = 1;
    }
  } else {
    analytics.currentStreak = 1;
  }

  analytics.lastActiveDate = now;

  saveAnalytics(userId, analytics);
}

/**
 * Registra una exportación
 */
export function trackExport(userId: string | null, format: 'pdf' | 'excel' | 'gherkin'): void {
  if (typeof window === 'undefined') return;

  const analytics = getUserAnalytics(userId);
  analytics.exportCount++;

  switch (format) {
    case 'pdf':
      analytics.featuresUsed.pdfExport++;
      break;
    case 'excel':
      analytics.featuresUsed.excelExport++;
      break;
    case 'gherkin':
      analytics.featuresUsed.gherkinExport++;
      break;
  }

  saveAnalytics(userId, analytics);
}

/**
 * Registra un favorito
 */
export function trackFavorite(userId: string | null): void {
  if (typeof window === 'undefined') return;

  const analytics = getUserAnalytics(userId);
  analytics.favoriteCount++;
  analytics.featuresUsed.favorites++;

  saveAnalytics(userId, analytics);
}

/**
 * Guarda las analytics en localStorage
 */
function saveAnalytics(userId: string | null, analytics: UserAnalytics): void {
  if (typeof window === 'undefined') return;

  const key = userId ? `${ANALYTICS_KEY}-${userId}` : ANALYTICS_KEY;
  localStorage.setItem(key, JSON.stringify(analytics));
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula tiempo estimado ahorrado (en horas)
 * Asumimos que cada caso de prueba ahorra ~5 minutos de documentación manual
 */
export function calculateTimeSaved(totalGenerations: number): number {
  const minutesPerGeneration = 5;
  const totalMinutes = totalGenerations * minutesPerGeneration;
  return parseFloat((totalMinutes / 60).toFixed(1));
}

/**
 * Calcula el crecimiento mes a mes
 */
export function calculateGrowth(thisMonth: number, lastMonth: number): {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (lastMonth === 0) {
    return { percentage: thisMonth > 0 ? 100 : 0, trend: thisMonth > 0 ? 'up' : 'stable' };
  }

  const percentage = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (percentage > 5) trend = 'up';
  if (percentage < -5) trend = 'down';

  return { percentage: Math.abs(percentage), trend };
}

/**
 * Obtiene la feature más utilizada
 */
export function getMostUsedFeature(analytics: UserAnalytics): {
  name: string;
  nameEn: string;
  count: number;
} | null {
  const features = [
    { key: 'textGeneration', name: 'Generación de texto', nameEn: 'Text generation', count: analytics.featuresUsed.textGeneration },
    { key: 'imageGeneration', name: 'Generación desde imagen', nameEn: 'Image generation', count: analytics.featuresUsed.imageGeneration },
    { key: 'pdfExport', name: 'Exportación PDF', nameEn: 'PDF export', count: analytics.featuresUsed.pdfExport },
    { key: 'excelExport', name: 'Exportación Excel', nameEn: 'Excel export', count: analytics.featuresUsed.excelExport },
    { key: 'gherkinExport', name: 'Exportación Gherkin', nameEn: 'Gherkin export', count: analytics.featuresUsed.gherkinExport },
    { key: 'favorites', name: 'Favoritos', nameEn: 'Favorites', count: analytics.featuresUsed.favorites }
  ];

  const sorted = features.sort((a, b) => b.count - a.count);
  const top = sorted[0];

  if (top.count === 0) return null;

  return {
    name: top.name,
    nameEn: top.nameEn,
    count: top.count
  };
}

/**
 * Reinicia las analytics (solo para desarrollo/testing)
 */
export function resetAnalytics(userId: string | null): void {
  if (typeof window === 'undefined') return;

  const key = userId ? `${ANALYTICS_KEY}-${userId}` : ANALYTICS_KEY;
  localStorage.removeItem(key);
}
