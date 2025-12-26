/**
 * Sistema de Trial de 14 días para Plan Pro
 * Permite a usuarios Free probar features Pro sin tarjeta de crédito
 */

import { initializeEmailNurturing } from './email-nurturing';

const TRIAL_DURATION_DAYS = 14;
const TRIAL_KEY = 'testcraft-pro-trial';
const TRIAL_START_KEY = 'testcraft-pro-trial-start';

export interface TrialInfo {
  isActive: boolean;
  isEligible: boolean;
  hasUsedTrial: boolean;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
}

/**
 * Verifica si el usuario es elegible para el trial
 * Un usuario es elegible si nunca ha usado el trial antes
 */
export function checkTrialEligibility(userId: string): boolean {
  if (typeof window === 'undefined') return false;

  const trialKey = `${TRIAL_KEY}-${userId}`;
  const hasUsedTrial = localStorage.getItem(trialKey);

  return !hasUsedTrial;
}

/**
 * Inicia el trial para un usuario
 */
export function startTrial(userId: string, userEmail?: string, userName?: string): boolean {
  if (typeof window === 'undefined') return false;

  const trialKey = `${TRIAL_KEY}-${userId}`;
  const trialStartKey = `${TRIAL_START_KEY}-${userId}`;

  // Verificar elegibilidad
  if (!checkTrialEligibility(userId)) {
    return false;
  }

  const now = new Date();
  localStorage.setItem(trialKey, 'used');
  localStorage.setItem(trialStartKey, now.toISOString());

  // Inicializar email nurturing si tenemos email y nombre
  if (userEmail && userName) {
    initializeEmailNurturing(userId, userEmail, userName, now.toISOString());
  }

  return true;
}

/**
 * Obtiene información completa del trial
 */
export function getTrialInfo(userId: string): TrialInfo {
  if (typeof window === 'undefined') {
    return {
      isActive: false,
      isEligible: false,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0
    };
  }

  const trialKey = `${TRIAL_KEY}-${userId}`;
  const trialStartKey = `${TRIAL_START_KEY}-${userId}`;

  const hasUsedTrial = !!localStorage.getItem(trialKey);
  const startDateStr = localStorage.getItem(trialStartKey);

  if (!hasUsedTrial || !startDateStr) {
    return {
      isActive: false,
      isEligible: !hasUsedTrial,
      hasUsedTrial,
      startDate: null,
      endDate: null,
      daysRemaining: 0
    };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);

  const now = new Date();
  const isActive = now < endDate;
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isActive,
    isEligible: false,
    hasUsedTrial,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    daysRemaining: Math.max(0, daysRemaining)
  };
}

/**
 * Cancela/termina el trial prematuramente
 */
export function cancelTrial(userId: string): void {
  if (typeof window === 'undefined') return;

  const trialStartKey = `${TRIAL_START_KEY}-${userId}`;

  // Marcar como terminado ajustando la fecha de inicio al pasado
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - (TRIAL_DURATION_DAYS + 1));
  localStorage.setItem(trialStartKey, pastDate.toISOString());
}

/**
 * Limpia datos del trial (solo para testing/desarrollo)
 */
export function resetTrial(userId: string): void {
  if (typeof window === 'undefined') return;

  const trialKey = `${TRIAL_KEY}-${userId}`;
  const trialStartKey = `${TRIAL_START_KEY}-${userId}`;

  localStorage.removeItem(trialKey);
  localStorage.removeItem(trialStartKey);
}
