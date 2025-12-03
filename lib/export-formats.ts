import { TestCase } from '@/app/page';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Exportar para Jira (formato CSV compatible con Jira Test Management)
export function exportToJira(testCases: TestCase[], projectKey: string = 'TEST'): void {
  const data = testCases.map((tc, index) => ({
    'Summary': tc.title,
    'Description': `Precondiciones: ${tc.preconditions}\n\nPasos:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nResultado Esperado: ${tc.expectedResult}`,
    'Issue Type': 'Test',
    'Priority': tc.priority === 'Alta' ? 'High' : tc.priority === 'Media' ? 'Medium' : 'Low',
    'Labels': tc.type,
    'Test Type': 'Manual',
    'Component': '',
    'Fix Version': '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tests');

  const csvBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  const blob = new Blob([csvBuffer], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `jira-tests-${new Date().toISOString().split('T')[0]}.csv`);
}

// Exportar para TestRail (formato CSV compatible)
export function exportToTestRail(testCases: TestCase[], sectionName: string = 'Imported Tests'): void {
  const data = testCases.map((tc) => ({
    'Title': tc.title,
    'Section': sectionName,
    'Template': 'Test Case (Steps)',
    'Type': tc.type === 'Positivo' ? 'Functional' : tc.type === 'Negativo' ? 'Negative' : 'Boundary',
    'Priority': tc.priority === 'Alta' ? 'Critical' : tc.priority === 'Media' ? 'High' : 'Medium',
    'Estimate': '',
    'References': '',
    'Automation Type': 'None',
    'Preconditions': tc.preconditions,
    'Steps': tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    'Expected Result': tc.expectedResult,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

  const csvBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  const blob = new Blob([csvBuffer], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `testrail-tests-${new Date().toISOString().split('T')[0]}.csv`);
}

// Exportar para Zephyr (formato CSV compatible con Zephyr Scale)
export function exportToZephyr(testCases: TestCase[]): void {
  const data = testCases.map((tc) => ({
    'Name': tc.title,
    'Objective': tc.preconditions,
    'Precondition': tc.preconditions,
    'Status': 'Draft',
    'Priority': tc.priority === 'Alta' ? 'High' : tc.priority === 'Media' ? 'Normal' : 'Low',
    'Component': '',
    'Labels': tc.type,
    'Owner': '',
    'Estimated Time': '',
    'Test Script (Step-by-Step)': tc.steps.map((s, i) => `Step ${i + 1}: ${s}`).join(' | '),
    'Test Script (Expected Result)': tc.expectedResult,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

  const csvBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
  const blob = new Blob([csvBuffer], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `zephyr-tests-${new Date().toISOString().split('T')[0]}.csv`);
}

// Exportar para qTest
export function exportToQTest(testCases: TestCase[]): void {
  const data = testCases.map((tc) => ({
    'Test Case Name': tc.title,
    'Description': `Tipo: ${tc.type}`,
    'Precondition': tc.preconditions,
    'Test Steps': tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    'Expected Results': tc.expectedResult,
    'Priority': tc.priority,
    'Type': 'Manual',
    'Status': 'New',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');

  const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `qtest-tests-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Exportar como JSON (para APIs o importaciones personalizadas)
export function exportToJSON(testCases: TestCase[]): void {
  const data = JSON.stringify(testCases, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  saveAs(blob, `test-cases-${new Date().toISOString().split('T')[0]}.json`);
}
