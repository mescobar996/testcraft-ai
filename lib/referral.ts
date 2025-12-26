/**
 * Sistema de Referral Program
 * Permite a usuarios invitar amigos y ganar rewards
 */

const REFERRAL_KEY = 'testcraft-referral';
const REFERRALS_KEY = 'testcraft-referrals';

export interface ReferralData {
  userId: string;
  referralCode: string;
  referredBy: string | null;
  referrals: string[];
  bonusEarned: number;
  totalReferrals: number;
}

/**
 * Genera un código de referido único para un usuario
 */
export function generateReferralCode(userId: string): string {
  // Usar primeros 8 caracteres del userId + timestamp
  const shortId = userId.substring(0, 8);
  const timestamp = Date.now().toString(36);
  return `${shortId}-${timestamp}`.toUpperCase();
}

/**
 * Obtiene datos de referral de un usuario
 */
export function getReferralData(userId: string): ReferralData {
  if (typeof window === 'undefined') {
    return {
      userId,
      referralCode: '',
      referredBy: null,
      referrals: [],
      bonusEarned: 0,
      totalReferrals: 0
    };
  }

  const key = `${REFERRAL_KEY}-${userId}`;
  const saved = localStorage.getItem(key);

  if (!saved) {
    // Crear nuevo código de referral
    const newCode = generateReferralCode(userId);
    const newData: ReferralData = {
      userId,
      referralCode: newCode,
      referredBy: null,
      referrals: [],
      bonusEarned: 0,
      totalReferrals: 0
    };
    localStorage.setItem(key, JSON.stringify(newData));
    return newData;
  }

  try {
    return JSON.parse(saved);
  } catch {
    const newCode = generateReferralCode(userId);
    return {
      userId,
      referralCode: newCode,
      referredBy: null,
      referrals: [],
      bonusEarned: 0,
      totalReferrals: 0
    };
  }
}

/**
 * Registra un nuevo referido
 */
export function addReferral(referrerId: string, referredUserId: string): { success: boolean; bonus: number } {
  if (typeof window === 'undefined') return { success: false, bonus: 0 };

  const referrerData = getReferralData(referrerId);

  // No permitir auto-referidos
  if (referrerId === referredUserId) {
    return { success: false, bonus: 0 };
  }

  // Verificar que no esté ya referido
  if (referrerData.referrals.includes(referredUserId)) {
    return { success: false, bonus: 0 };
  }

  // Agregar referido
  referrerData.referrals.push(referredUserId);
  referrerData.totalReferrals++;
  referrerData.bonusEarned += 5; // +5 generaciones por referido

  const key = `${REFERRAL_KEY}-${referrerId}`;
  localStorage.setItem(key, JSON.stringify(referrerData));

  return { success: true, bonus: 5 };
}

/**
 * Marca a un usuario como referido por otro
 */
export function markAsReferred(userId: string, referralCode: string): boolean {
  if (typeof window === 'undefined') return false;

  const userData = getReferralData(userId);

  // Ya fue referido antes
  if (userData.referredBy) {
    return false;
  }

  userData.referredBy = referralCode;

  const key = `${REFERRAL_KEY}-${userId}`;
  localStorage.setItem(key, JSON.stringify(userData));

  return true;
}

/**
 * Obtiene la URL de referido
 */
export function getReferralUrl(referralCode: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://testcraft-ai.com';

  return `${baseUrl}/?ref=${referralCode}`;
}

/**
 * Extrae el código de referido de la URL
 */
export function getReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}
