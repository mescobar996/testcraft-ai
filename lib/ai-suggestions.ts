/**
 * Sistema de AI Quality Suggestions
 * Analiza casos de prueba generados y sugiere mejoras
 */

import type { TestCase } from "@/app/page";

export interface QualitySuggestion {
  id: string;
  type: 'improvement' | 'duplicate' | 'coverage' | 'clarity';
  severity: 'low' | 'medium' | 'high';
  testCaseId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  suggestion: string;
  suggestionEn: string;
}

/**
 * Analiza casos de prueba y genera sugerencias de calidad
 */
export function analyzeTestCases(testCases: TestCase[]): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];

  // 1. Detectar casos duplicados
  const duplicates = detectDuplicates(testCases);
  suggestions.push(...duplicates);

  // 2. Analizar cobertura
  const coverage = analyzeCoverage(testCases);
  suggestions.push(...coverage);

  // 3. Verificar claridad de pasos
  const clarity = checkStepsClarity(testCases);
  suggestions.push(...clarity);

  // 4. Sugerir mejoras generales
  const improvements = suggestImprovements(testCases);
  suggestions.push(...improvements);

  return suggestions;
}

/**
 * Detecta casos de prueba duplicados o muy similares
 */
function detectDuplicates(testCases: TestCase[]): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];
  const seen = new Set<string>();

  testCases.forEach((testCase, index) => {
    // Crear un "fingerprint" del caso
    const fingerprint = createFingerprint(testCase);

    if (seen.has(fingerprint)) {
      suggestions.push({
        id: `dup-${testCase.id}`,
        type: 'duplicate',
        severity: 'medium',
        testCaseId: testCase.id,
        title: 'Posible caso duplicado',
        titleEn: 'Possible duplicate case',
        description: `El caso "${testCase.title}" parece ser muy similar a otro caso ya generado.`,
        descriptionEn: `The case "${testCase.title}" appears to be very similar to another generated case.`,
        suggestion: 'Considera eliminar o fusionar este caso con el similar.',
        suggestionEn: 'Consider removing or merging this case with the similar one.'
      });
    }

    seen.add(fingerprint);
  });

  return suggestions;
}

/**
 * Crea un fingerprint del caso de prueba para detección de duplicados
 */
function createFingerprint(testCase: TestCase): string {
  const titleNorm = testCase.title.toLowerCase().trim();
  const stepsNorm = testCase.steps.map(s => s.toLowerCase().trim()).join('|');
  return `${testCase.type}-${titleNorm}-${stepsNorm}`.substring(0, 100);
}

/**
 * Analiza la cobertura de tipos de casos
 */
function analyzeCoverage(testCases: TestCase[]): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];

  const typeCount = {
    Positivo: testCases.filter(tc => tc.type === 'Positivo').length,
    Negativo: testCases.filter(tc => tc.type === 'Negativo').length,
    Borde: testCases.filter(tc => tc.type === 'Borde').length
  };

  // Sugerir si falta algún tipo
  if (typeCount.Positivo === 0) {
    suggestions.push({
      id: 'cov-positive',
      type: 'coverage',
      severity: 'high',
      testCaseId: '',
      title: 'Falta cobertura de casos positivos',
      titleEn: 'Missing positive test coverage',
      description: 'No se han generado casos de prueba positivos (happy path).',
      descriptionEn: 'No positive test cases (happy path) have been generated.',
      suggestion: 'Agrega casos que validen el funcionamiento esperado del sistema.',
      suggestionEn: 'Add cases that validate the expected system behavior.'
    });
  }

  if (typeCount.Negativo === 0) {
    suggestions.push({
      id: 'cov-negative',
      type: 'coverage',
      severity: 'high',
      testCaseId: '',
      title: 'Falta cobertura de casos negativos',
      titleEn: 'Missing negative test coverage',
      description: 'No se han generado casos de prueba negativos (manejo de errores).',
      descriptionEn: 'No negative test cases (error handling) have been generated.',
      suggestion: 'Agrega casos que validen el manejo de errores y validaciones.',
      suggestionEn: 'Add cases that validate error handling and validations.'
    });
  }

  if (typeCount.Borde === 0) {
    suggestions.push({
      id: 'cov-edge',
      type: 'coverage',
      severity: 'medium',
      testCaseId: '',
      title: 'Falta cobertura de casos borde',
      titleEn: 'Missing edge case coverage',
      description: 'No se han generado casos de borde (límites, casos extremos).',
      descriptionEn: 'No edge cases (limits, extreme cases) have been generated.',
      suggestion: 'Agrega casos que prueben límites y condiciones especiales.',
      suggestionEn: 'Add cases that test limits and special conditions.'
    });
  }

  // Sugerir balance
  const total = testCases.length;
  if (total >= 3) {
    const positiveRatio = typeCount.Positivo / total;
    const negativeRatio = typeCount.Negativo / total;

    if (positiveRatio < 0.3 || positiveRatio > 0.7) {
      suggestions.push({
        id: 'cov-balance',
        type: 'coverage',
        severity: 'low',
        testCaseId: '',
        title: 'Desbalance en tipos de casos',
        titleEn: 'Imbalanced test types',
        description: `Balance actual: ${Math.round(positiveRatio * 100)}% positivos, ${Math.round(negativeRatio * 100)}% negativos.`,
        descriptionEn: `Current balance: ${Math.round(positiveRatio * 100)}% positive, ${Math.round(negativeRatio * 100)}% negative.`,
        suggestion: 'Considera un balance más equilibrado entre tipos (40-50% positivos, 30-40% negativos, 10-20% borde).',
        suggestionEn: 'Consider a more balanced distribution (40-50% positive, 30-40% negative, 10-20% edge).'
      });
    }
  }

  return suggestions;
}

/**
 * Verifica la claridad y completitud de los pasos
 */
function checkStepsClarity(testCases: TestCase[]): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];

  testCases.forEach(testCase => {
    // Casos con muy pocos pasos
    if (testCase.steps.length === 1) {
      suggestions.push({
        id: `clarity-steps-${testCase.id}`,
        type: 'clarity',
        severity: 'low',
        testCaseId: testCase.id,
        title: 'Caso con un solo paso',
        titleEn: 'Single-step test case',
        description: `El caso "${testCase.title}" tiene solo un paso.`,
        descriptionEn: `The case "${testCase.title}" has only one step.`,
        suggestion: 'Considera dividir en pasos más detallados para mejor trazabilidad.',
        suggestionEn: 'Consider breaking down into more detailed steps for better traceability.'
      });
    }

    // Pasos demasiado largos
    testCase.steps.forEach((step, index) => {
      if (step.length > 200) {
        suggestions.push({
          id: `clarity-long-${testCase.id}-${index}`,
          type: 'clarity',
          severity: 'low',
          testCaseId: testCase.id,
          title: 'Paso muy largo',
          titleEn: 'Very long step',
          description: `El paso ${index + 1} del caso "${testCase.title}" es muy extenso.`,
          descriptionEn: `Step ${index + 1} of case "${testCase.title}" is very long.`,
          suggestion: 'Divide este paso en sub-pasos más concisos.',
          suggestionEn: 'Break this step into more concise sub-steps.'
        });
      }
    });

    // Precondiciones vacías
    if (!testCase.preconditions || testCase.preconditions.trim().length < 10) {
      suggestions.push({
        id: `clarity-precond-${testCase.id}`,
        type: 'clarity',
        severity: 'medium',
        testCaseId: testCase.id,
        title: 'Precondiciones incompletas',
        titleEn: 'Incomplete preconditions',
        description: `El caso "${testCase.title}" no tiene precondiciones claras.`,
        descriptionEn: `The case "${testCase.title}" doesn't have clear preconditions.`,
        suggestion: 'Agrega las condiciones iniciales necesarias para ejecutar este caso.',
        suggestionEn: 'Add the necessary initial conditions to execute this case.'
      });
    }
  });

  return suggestions;
}

/**
 * Sugiere mejoras generales basadas en mejores prácticas
 */
function suggestImprovements(testCases: TestCase[]): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];

  // Sugerir agregar más casos si hay muy pocos
  if (testCases.length < 3) {
    suggestions.push({
      id: 'imp-count',
      type: 'improvement',
      severity: 'medium',
      testCaseId: '',
      title: 'Cobertura insuficiente',
      titleEn: 'Insufficient coverage',
      description: `Solo se han generado ${testCases.length} casos de prueba.`,
      descriptionEn: `Only ${testCases.length} test cases have been generated.`,
      suggestion: 'Genera más casos para mejorar la cobertura (recomendado: al menos 5-7 casos).',
      suggestionEn: 'Generate more cases to improve coverage (recommended: at least 5-7 cases).'
    });
  }

  // Sugerir priorización
  const highPriorityCount = testCases.filter(tc => tc.priority === 'Alta').length;
  if (highPriorityCount === testCases.length && testCases.length > 3) {
    suggestions.push({
      id: 'imp-priority',
      type: 'improvement',
      severity: 'low',
      testCaseId: '',
      title: 'Todos los casos son de prioridad alta',
      titleEn: 'All cases are high priority',
      description: 'Todos los casos tienen prioridad "Alta".',
      descriptionEn: 'All cases have "High" priority.',
      suggestion: 'Revisa y ajusta prioridades para una mejor gestión (70% alta, 20% media, 10% baja).',
      suggestionEn: 'Review and adjust priorities for better management (70% high, 20% medium, 10% low).'
    });
  }

  return suggestions;
}

/**
 * Filtra sugerencias por severidad
 */
export function filterBySeverity(
  suggestions: QualitySuggestion[],
  severity: 'low' | 'medium' | 'high'
): QualitySuggestion[] {
  return suggestions.filter(s => s.severity === severity);
}

/**
 * Obtiene el conteo de sugerencias por tipo
 */
export function getSuggestionCounts(suggestions: QualitySuggestion[]): Record<string, number> {
  return {
    improvement: suggestions.filter(s => s.type === 'improvement').length,
    duplicate: suggestions.filter(s => s.type === 'duplicate').length,
    coverage: suggestions.filter(s => s.type === 'coverage').length,
    clarity: suggestions.filter(s => s.type === 'clarity').length
  };
}
