/**
 * Esquemas de validación con Zod para todas las APIs
 */
import { z } from 'zod';
import { VALIDATION } from './constants';

export const GenerateRequestSchema = z.object({
  requirement: z.string()
    .min(VALIDATION.MIN_REQUIREMENT_LENGTH, `El requisito debe tener al menos ${VALIDATION.MIN_REQUIREMENT_LENGTH} caracteres`)
    .max(VALIDATION.MAX_REQUIREMENT_LENGTH, `El requisito no puede exceder ${VALIDATION.MAX_REQUIREMENT_LENGTH} caracteres`)
    .trim(),
  context: z.string()
    .max(VALIDATION.MAX_CONTEXT_LENGTH, `El contexto no puede exceder ${VALIDATION.MAX_CONTEXT_LENGTH} caracteres`)
    .optional()
    .default(''),
  format: z.enum(['table', 'gherkin', 'both']).optional().default('both'),
});

export const RegisterRequestSchema = z.object({
  name: z.string()
    .min(VALIDATION.MIN_NAME_LENGTH, `El nombre debe tener al menos ${VALIDATION.MIN_NAME_LENGTH} caracteres`)
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${VALIDATION.MIN_PASSWORD_LENGTH} caracteres`)
    .regex(VALIDATION.PASSWORD_REGEX, 'La contraseña debe tener mayúsculas, minúsculas y números'),
});

export const LoginRequestSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
