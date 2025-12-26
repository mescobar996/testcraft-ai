import { TestCase } from '@/app/page';

export interface ExportColumn {
  header: string;
  field: keyof TestCase | 'custom';
  formatter?: (tc: TestCase) => string;
  defaultValue?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'csv' | 'xlsx' | 'json';
  columns: ExportColumn[];
  isCustom?: boolean;
}

// Mapear tipos para diferentes sistemas
const mapType = (type: string, target: 'jira' | 'testrail' | 'zephyr' | 'qtest') => {
  const mappings = {
    jira: { 'Positivo': 'Functional', 'Negativo': 'Negative', 'Borde': 'Boundary' },
    testrail: { 'Positivo': 'Functional', 'Negativo': 'Negative', 'Borde': 'Boundary' },
    zephyr: { 'Positivo': 'Functional', 'Negativo': 'Negative', 'Borde': 'Edge Case' },
    qtest: { 'Positivo': 'Positive', 'Negativo': 'Negative', 'Borde': 'Boundary' },
  };
  return mappings[target][type as 'Positivo' | 'Negativo' | 'Borde'] || type;
};

// Mapear prioridades
const mapPriority = (priority: string, target: 'jira' | 'testrail' | 'zephyr' | 'qtest') => {
  const mappings = {
    jira: { 'Alta': 'High', 'Media': 'Medium', 'Baja': 'Low' },
    testrail: { 'Alta': 'Critical', 'Media': 'High', 'Baja': 'Medium' },
    zephyr: { 'Alta': 'High', 'Media': 'Normal', 'Baja': 'Low' },
    qtest: { 'Alta': 'High', 'Media': 'Medium', 'Baja': 'Low' },
  };
  return mappings[target][priority as 'Alta' | 'Media' | 'Baja'] || priority;
};

// Templates predefinidos
export const BUILTIN_TEMPLATES: ExportTemplate[] = [
  {
    id: 'jira-standard',
    name: 'Jira Standard',
    description: 'Formato CSV compatible con Jira Test Management',
    format: 'csv',
    columns: [
      { header: 'Summary', field: 'title' },
      {
        header: 'Description',
        field: 'custom',
        formatter: (tc) => `Precondiciones: ${tc.preconditions}\n\nPasos:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nResultado: ${tc.expectedResult}`
      },
      { header: 'Issue Type', field: 'custom', defaultValue: 'Test' },
      { header: 'Priority', field: 'custom', formatter: (tc) => mapPriority(tc.priority, 'jira') },
      { header: 'Labels', field: 'type' },
      { header: 'Test Type', field: 'custom', defaultValue: 'Manual' },
    ]
  },
  {
    id: 'testrail-detailed',
    name: 'TestRail Detailed',
    description: 'Formato completo para TestRail con todos los campos',
    format: 'csv',
    columns: [
      { header: 'Title', field: 'title' },
      { header: 'Section', field: 'custom', defaultValue: 'TestCraft Import' },
      { header: 'Template', field: 'custom', defaultValue: 'Test Case (Steps)' },
      { header: 'Type', field: 'custom', formatter: (tc) => mapType(tc.type, 'testrail') },
      { header: 'Priority', field: 'custom', formatter: (tc) => mapPriority(tc.priority, 'testrail') },
      { header: 'Automation Type', field: 'custom', defaultValue: 'None' },
      { header: 'Preconditions', field: 'preconditions' },
      { header: 'Steps', field: 'custom', formatter: (tc) => tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') },
      { header: 'Expected Result', field: 'expectedResult' },
    ]
  },
  {
    id: 'zephyr-scale',
    name: 'Zephyr Scale',
    description: 'Formato optimizado para Zephyr Scale (Jira plugin)',
    format: 'csv',
    columns: [
      { header: 'Name', field: 'title' },
      { header: 'Objective', field: 'preconditions' },
      { header: 'Precondition', field: 'preconditions' },
      { header: 'Status', field: 'custom', defaultValue: 'Draft' },
      { header: 'Priority', field: 'custom', formatter: (tc) => mapPriority(tc.priority, 'zephyr') },
      { header: 'Labels', field: 'type' },
      {
        header: 'Test Script (Step-by-Step)',
        field: 'custom',
        formatter: (tc) => tc.steps.map((s, i) => `Step ${i + 1}: ${s}`).join(' | ')
      },
      { header: 'Test Script (Expected Result)', field: 'expectedResult' },
    ]
  },
  {
    id: 'qtest-manager',
    name: 'qTest Manager',
    description: 'Formato Excel para qTest Manager',
    format: 'xlsx',
    columns: [
      { header: 'Test Case Name', field: 'title' },
      { header: 'Description', field: 'custom', formatter: (tc) => `Tipo: ${tc.type}` },
      { header: 'Precondition', field: 'preconditions' },
      { header: 'Test Steps', field: 'custom', formatter: (tc) => tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') },
      { header: 'Expected Results', field: 'expectedResult' },
      { header: 'Priority', field: 'custom', formatter: (tc) => mapPriority(tc.priority, 'qtest') },
      { header: 'Type', field: 'custom', defaultValue: 'Manual' },
      { header: 'Status', field: 'custom', defaultValue: 'New' },
    ]
  },
  {
    id: 'excel-basic',
    name: 'Excel Básico',
    description: 'Hoja de cálculo simple con todos los campos',
    format: 'xlsx',
    columns: [
      { header: 'ID', field: 'id' },
      { header: 'Título', field: 'title' },
      { header: 'Tipo', field: 'type' },
      { header: 'Prioridad', field: 'priority' },
      { header: 'Precondiciones', field: 'preconditions' },
      { header: 'Pasos', field: 'custom', formatter: (tc) => tc.steps.join(' | ') },
      { header: 'Resultado Esperado', field: 'expectedResult' },
    ]
  },
  {
    id: 'json-full',
    name: 'JSON Completo',
    description: 'Exportación completa en formato JSON',
    format: 'json',
    columns: [] // JSON exports the full object
  }
];

// Guardar template personalizado
export function saveCustomTemplate(template: ExportTemplate): void {
  const templates = getCustomTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, isCustom: true };
  } else {
    templates.push({ ...template, isCustom: true });
  }

  localStorage.setItem('testcraft_custom_templates', JSON.stringify(templates));
}

// Obtener templates personalizados
export function getCustomTemplates(): ExportTemplate[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('testcraft_custom_templates');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Eliminar template personalizado
export function deleteCustomTemplate(templateId: string): void {
  const templates = getCustomTemplates();
  const filtered = templates.filter(t => t.id !== templateId);
  localStorage.setItem('testcraft_custom_templates', JSON.stringify(filtered));
}

// Obtener todos los templates (built-in + custom)
export function getAllTemplates(): ExportTemplate[] {
  return [...BUILTIN_TEMPLATES, ...getCustomTemplates()];
}

// Aplicar template a test cases
export function applyTemplate(template: ExportTemplate, testCases: TestCase[]): any[] {
  if (template.format === 'json') {
    return testCases; // Return raw objects for JSON
  }

  return testCases.map(tc => {
    const row: Record<string, any> = {};

    template.columns.forEach(col => {
      if (col.formatter) {
        row[col.header] = col.formatter(tc);
      } else if (col.field === 'custom') {
        row[col.header] = col.defaultValue || '';
      } else {
        row[col.header] = tc[col.field];
      }
    });

    return row;
  });
}

// Generar nombre de archivo
export function generateFilename(template: ExportTemplate): string {
  const date = new Date().toISOString().split('T')[0];
  const extension = template.format === 'csv' ? 'csv' : template.format === 'xlsx' ? 'xlsx' : 'json';
  const safeName = template.name.toLowerCase().replace(/\s+/g, '-');
  return `${safeName}-${date}.${extension}`;
}
