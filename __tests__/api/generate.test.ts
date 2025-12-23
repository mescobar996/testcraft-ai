/**
 * Tests para la API de generación de casos de prueba
 * @jest-environment node
 */

import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';
import { GenerateRequestSchema } from '@/lib/validations';

// Mock de Anthropic
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              testCases: [
                {
                  id: 'TC001',
                  title: 'Test case generado',
                  preconditions: 'Usuario autenticado',
                  steps: ['Paso 1', 'Paso 2'],
                  expectedResult: 'Resultado esperado',
                  priority: 'Alta',
                  type: 'Positivo'
                }
              ],
              gherkin: 'Feature: Test\nScenario: Test scenario\nGiven...',
              summary: 'Resumen de test'
            })
          }
        ]
      })
    }
  }));
});

// Mock de Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } }
      })
    }
  }))
}));

// Mock de cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

describe('POST /api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe validar entrada con Zod correctamente', async () => {
    const validData = {
      requirement: 'Este es un requisito válido de al menos 10 caracteres',
      context: 'Contexto adicional',
      format: 'both'
    };

    const result = GenerateRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('debe rechazar requisitos muy cortos', async () => {
    const invalidData = {
      requirement: 'Muy corto',
      context: '',
      format: 'both'
    };

    const result = GenerateRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('al menos 10 caracteres');
    }
  });

  it('debe rechazar requisitos muy largos', async () => {
    const invalidData = {
      requirement: 'a'.repeat(6000), // Mayor a 5000
      context: '',
      format: 'both'
    };

    const result = GenerateRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('no puede exceder 5000 caracteres');
    }
  });

  it('debe aceptar formato válido', async () => {
    const dataTable = {
      requirement: 'Requisito válido de test',
      format: 'table'
    };

    const dataGherkin = {
      requirement: 'Requisito válido de test',
      format: 'gherkin'
    };

    const dataBoth = {
      requirement: 'Requisito válido de test',
      format: 'both'
    };

    expect(GenerateRequestSchema.safeParse(dataTable).success).toBe(true);
    expect(GenerateRequestSchema.safeParse(dataGherkin).success).toBe(true);
    expect(GenerateRequestSchema.safeParse(dataBoth).success).toBe(true);
  });

  it('debe usar valor por defecto para formato', async () => {
    const data = {
      requirement: 'Requisito válido de test'
    };

    const result = GenerateRequestSchema.parse(data);
    expect(result.format).toBe('both');
  });

  it('debe trimear espacios del requisito', async () => {
    const data = {
      requirement: '  Requisito con espacios  '
    };

    const result = GenerateRequestSchema.parse(data);
    expect(result.requirement).toBe('Requisito con espacios');
  });

  it('debe manejar contexto opcional', async () => {
    const dataWithContext = {
      requirement: 'Requisito válido de test',
      context: 'Contexto adicional'
    };

    const dataWithoutContext = {
      requirement: 'Requisito válido de test'
    };

    const resultWith = GenerateRequestSchema.parse(dataWithContext);
    const resultWithout = GenerateRequestSchema.parse(dataWithoutContext);

    expect(resultWith.context).toBe('Contexto adicional');
    expect(resultWithout.context).toBe('');
  });
});

describe('Validación de contexto', () => {
  it('debe rechazar contexto muy largo', async () => {
    const invalidData = {
      requirement: 'Requisito válido',
      context: 'a'.repeat(2001) // Mayor a 2000
    };

    const result = GenerateRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('no puede exceder 2000 caracteres');
    }
  });

  it('debe aceptar contexto en el límite', async () => {
    const validData = {
      requirement: 'Requisito válido',
      context: 'a'.repeat(2000) // Exactamente 2000
    };

    const result = GenerateRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
