/**
 * Constantes centralizadas del proyecto TestCraft AI
 * Mantener todas las configuraciones y límites aquí para facilitar el mantenimiento
 */

export const LIMITS = {
  FREE_ANONYMOUS_DAILY: 5,
  FREE_REGISTERED_MONTHLY: 10, // 10 generaciones por mes (30 días)
  PRO_MONTHLY: 500,
  ENTERPRISE_MONTHLY: -1, // ilimitado
} as const;

export const VALIDATION = {
  MIN_REQUIREMENT_LENGTH: 10,
  MAX_REQUIREMENT_LENGTH: 5000,
  MAX_CONTEXT_LENGTH: 2000,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 2,
  PASSWORD_REGEX: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
  EMAIL_REGEX: /\S+@\S+\.\S+/,
} as const;

export const ERROR_MESSAGES = {
  LIMIT_REACHED: "Has alcanzado el límite mensual de generaciones. Actualiza a Pro para obtener 500 generaciones por mes.",
  RATE_LIMIT_EXCEEDED: "Demasiadas solicitudes. Por favor, intenta de nuevo en unos minutos.",
  INVALID_EMAIL: "Email inválido",
  WEAK_PASSWORD: "La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas y números",
  PASSWORD_MISMATCH: "Las contraseñas no coinciden",
  REQUIRED_FIELD: "Este campo es requerido",
  IMAGE_TOO_LARGE: "La imagen no puede exceder 10MB",
  INVALID_IMAGE_FORMAT: "Formato de imagen no soportado. Usa JPG, PNG, GIF o WebP.",
  GENERATION_FAILED: "No pudimos generar los casos de prueba. Por favor, intenta de nuevo.",
  CONNECTION_ERROR: "Error de conexión. Por favor, verifica tu conexión a internet.",
  INVALID_INPUT: "Los datos proporcionados no son válidos",
} as const;

export const ANTHROPIC = {
  MODEL: "claude-sonnet-4-20250514",
  MAX_TOKENS: 4096,
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"] as const,
} as const;

export const CACHE = {
  GENERATION_TTL: 60 * 60 * 24, // 24 horas en segundos
  HISTORY_TTL: 60 * 60 * 24 * 7, // 7 días
} as const;

export const RATE_LIMITING = {
  ANONYMOUS_REQUESTS_PER_HOUR: 10,
  AUTHENTICATED_REQUESTS_PER_HOUR: 100,
  WINDOW_MS: 60 * 60 * 1000, // 1 hora en milisegundos
} as const;
