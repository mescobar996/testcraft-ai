/**
 * Tests para constantes del proyecto
 */

import { LIMITS, VALIDATION, ERROR_MESSAGES, ANTHROPIC, RATE_LIMITING } from '@/lib/constants';

describe('Constantes - LIMITS', () => {
  it('debe tener límites definidos correctamente', () => {
    expect(LIMITS.FREE_ANONYMOUS_DAILY).toBe(5);
    expect(LIMITS.FREE_REGISTERED_DAILY).toBe(20);
    expect(LIMITS.PRO_MONTHLY).toBe(500);
    expect(LIMITS.ENTERPRISE_MONTHLY).toBe(-1);
  });

  it('límites deben ser números', () => {
    expect(typeof LIMITS.FREE_ANONYMOUS_DAILY).toBe('number');
    expect(typeof LIMITS.FREE_REGISTERED_DAILY).toBe('number');
    expect(typeof LIMITS.PRO_MONTHLY).toBe('number');
    expect(typeof LIMITS.ENTERPRISE_MONTHLY).toBe('number');
  });

  it('límites registrados deben ser mayores que anónimos', () => {
    expect(LIMITS.FREE_REGISTERED_DAILY).toBeGreaterThan(LIMITS.FREE_ANONYMOUS_DAILY);
  });
});

describe('Constantes - VALIDATION', () => {
  it('debe tener límites de validación coherentes', () => {
    expect(VALIDATION.MIN_REQUIREMENT_LENGTH).toBeLessThan(VALIDATION.MAX_REQUIREMENT_LENGTH);
    expect(VALIDATION.MAX_CONTEXT_LENGTH).toBeLessThan(VALIDATION.MAX_REQUIREMENT_LENGTH);
    expect(VALIDATION.MIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(8);
  });

  it('tamaño de imagen en bytes debe coincidir con MB', () => {
    const expectedBytes = VALIDATION.MAX_IMAGE_SIZE_MB * 1024 * 1024;
    expect(VALIDATION.MAX_IMAGE_SIZE_BYTES).toBe(expectedBytes);
  });

  it('regex de password debe validar correctamente', () => {
    const regex = VALIDATION.PASSWORD_REGEX;

    // Válidas
    expect(regex.test('Password123')).toBe(true);
    expect(regex.test('Test1234')).toBe(true);
    expect(regex.test('aB1cdefg')).toBe(true);

    // Inválidas
    expect(regex.test('password')).toBe(false); // Sin mayúscula ni número
    expect(regex.test('PASSWORD')).toBe(false); // Sin minúscula ni número
    expect(regex.test('Password')).toBe(false); // Sin número
    expect(regex.test('12345678')).toBe(false); // Sin letras
  });

  it('regex de email debe validar correctamente', () => {
    const regex = VALIDATION.EMAIL_REGEX;

    // Válidos
    expect(regex.test('test@example.com')).toBe(true);
    expect(regex.test('user.name@domain.co.uk')).toBe(true);

    // Inválidos
    expect(regex.test('invalid')).toBe(false);
    expect(regex.test('@example.com')).toBe(false);
    expect(regex.test('test@')).toBe(false);
  });
});

describe('Constantes - ERROR_MESSAGES', () => {
  it('debe tener mensajes de error definidos', () => {
    expect(ERROR_MESSAGES.LIMIT_REACHED).toBeDefined();
    expect(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED).toBeDefined();
    expect(ERROR_MESSAGES.INVALID_EMAIL).toBeDefined();
    expect(ERROR_MESSAGES.GENERATION_FAILED).toBeDefined();
  });

  it('mensajes de error deben ser strings no vacíos', () => {
    Object.values(ERROR_MESSAGES).forEach(message => {
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });
});

describe('Constantes - ANTHROPIC', () => {
  it('debe tener configuración de Anthropic correcta', () => {
    expect(ANTHROPIC.MODEL).toBe('claude-sonnet-4-20250514');
    expect(ANTHROPIC.MAX_TOKENS).toBe(4096);
    expect(ANTHROPIC.SUPPORTED_IMAGE_TYPES).toHaveLength(4);
  });

  it('tipos de imagen soportados deben incluir formatos comunes', () => {
    const types = ANTHROPIC.SUPPORTED_IMAGE_TYPES;
    expect(types).toContain('image/jpeg');
    expect(types).toContain('image/png');
    expect(types).toContain('image/gif');
    expect(types).toContain('image/webp');
  });
});

describe('Constantes - RATE_LIMITING', () => {
  it('debe tener límites de rate limiting configurados', () => {
    expect(RATE_LIMITING.ANONYMOUS_REQUESTS_PER_HOUR).toBe(10);
    expect(RATE_LIMITING.AUTHENTICATED_REQUESTS_PER_HOUR).toBe(100);
    expect(RATE_LIMITING.WINDOW_MS).toBe(60 * 60 * 1000); // 1 hora
  });

  it('usuarios autenticados deben tener más requests que anónimos', () => {
    expect(RATE_LIMITING.AUTHENTICATED_REQUESTS_PER_HOUR)
      .toBeGreaterThan(RATE_LIMITING.ANONYMOUS_REQUESTS_PER_HOUR);
  });
});
