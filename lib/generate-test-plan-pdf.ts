import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TestCase {
  id: string;
  title: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: "Alta" | "Media" | "Baja";
  type: "Positivo" | "Negativo" | "Borde";
}

interface TestPlanConfig {
  projectName: string;
  version: string;
  author: string;
  date: string;
  requirement: string;
  testCases: TestCase[];
  gherkin?: string;
  summary?: string;
  scope?: string;
}

export function generateTestPlanPDF(config: TestPlanConfig) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  const primaryColor: [number, number, number] = [124, 58, 237];
  const darkColor: [number, number, number] = [30, 41, 59];
  const lightColor: [number, number, number] = [148, 163, 184];

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  const drawHeader = (text: string, fontSize: number = 16) => {
    addNewPageIfNeeded(20);
    doc.setFontSize(fontSize);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, currentY);
    currentY += fontSize * 0.5 + 5;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
    currentY += 5;
  };

  const drawText = (text: string, fontSize: number = 11) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    lines.forEach((line: string) => {
      addNewPageIfNeeded(10);
      doc.text(line, margin, currentY);
      currentY += fontSize * 0.5;
    });
    currentY += 3;
  };

  // ========== PAGE 1: COVER ==========
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth / 2 - 25, 20, 50, 50, 5, 5, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TC', pageWidth / 2, 52, { align: 'center' });
  
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text('TEST PLAN', pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setTextColor(...darkColor);
  doc.text(config.projectName || 'Proyecto de Testing', pageWidth / 2, 130, { align: 'center' });
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(pageWidth / 2 - 20, 145, 40, 12, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Versión ${config.version || '1.0'}`, pageWidth / 2, 153, { align: 'center' });
  
  const boxY = 180;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, boxY, pageWidth - 2 * margin, 60, 5, 5, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  
  const metaItems = [
    { label: 'Autor:', value: config.author || 'QA Team' },
    { label: 'Fecha:', value: config.date || new Date().toLocaleDateString('es-AR') },
    { label: 'Casos de Prueba:', value: config.testCases.length.toString() },
    { label: 'Estado:', value: 'En Revisión' },
  ];
  
  metaItems.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + 10 + col * 85;
    const y = boxY + 18 + row * 22;
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value, x + 45, y);
  });
  
  doc.setFontSize(9);
  doc.setTextColor(...lightColor);
  doc.text('Generado con TestCraft AI', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ========== PAGE 2: INDEX ==========
  doc.addPage();
  currentY = margin;
  drawHeader('ÍNDICE', 20);
  currentY += 10;
  
  const tocItems = [
    { num: '1', title: 'Información del Proyecto', page: '3' },
    { num: '2', title: 'Alcance y Objetivos', page: '3' },
    { num: '3', title: 'Requisito Analizado', page: '4' },
    { num: '4', title: 'Resumen de Casos', page: '4' },
    { num: '5', title: 'Detalle de Casos', page: '5' },
    { num: '6', title: 'Matriz de Trazabilidad', page: '7' },
    { num: '7', title: 'Resumen Ejecutivo', page: '8' },
    { num: '8', title: 'Aprobaciones', page: '8' },
  ];
  
  tocItems.forEach((item) => {
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.num}.`, margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(item.title, margin + 15, currentY);
    doc.setDrawColor(...lightColor);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 80, currentY, pageWidth - margin - 15, currentY);
    doc.setLineDashPattern([], 0);
    doc.text(item.page, pageWidth - margin - 5, currentY, { align: 'right' });
    currentY += 12;
  });

  // ========== PAGE 3: PROJECT INFO ==========
  doc.addPage();
  currentY = margin;
  drawHeader('1. INFORMACIÓN DEL PROYECTO', 16);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Campo', 'Valor']],
    body: [
      ['Nombre del Proyecto', config.projectName || 'Proyecto'],
      ['Versión', config.version || '1.0'],
      ['Autor', config.author || 'QA Team'],
      ['Fecha', config.date || new Date().toLocaleDateString('es-AR')],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    margin: { left: margin, right: margin },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;
  drawHeader('2. ALCANCE Y OBJETIVOS', 16);
  drawText(config.scope || 'Este plan cubre la validación funcional del requisito especificado, incluyendo casos positivos, negativos y de borde.');

  // ========== PAGE 4: REQUIREMENT & SUMMARY ==========
  doc.addPage();
  currentY = margin;
  drawHeader('3. REQUISITO ANALIZADO', 16);
  
  doc.setFillColor(248, 250, 252);
  const reqLines = doc.splitTextToSize(config.requirement || 'No especificado', pageWidth - 2 * margin - 20);
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, reqLines.length * 6 + 15, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  reqLines.forEach((line: string, i: number) => {
    doc.text(line, margin + 10, currentY + 10 + i * 6);
  });
  currentY += reqLines.length * 6 + 25;
  
  drawHeader('4. RESUMEN DE CASOS', 16);
  
  const stats = {
    total: config.testCases.length,
    positivos: config.testCases.filter(tc => tc.type === 'Positivo').length,
    negativos: config.testCases.filter(tc => tc.type === 'Negativo').length,
    borde: config.testCases.filter(tc => tc.type === 'Borde').length,
  };
  
  const boxWidth = (pageWidth - 2 * margin - 30) / 4;
  const statsData = [
    { label: 'Total', value: stats.total, color: primaryColor },
    { label: 'Positivos', value: stats.positivos, color: [34, 197, 94] as [number, number, number] },
    { label: 'Negativos', value: stats.negativos, color: [239, 68, 68] as [number, number, number] },
    { label: 'Borde', value: stats.borde, color: [234, 179, 8] as [number, number, number] },
  ];
  
  statsData.forEach((stat, i) => {
    const x = margin + i * (boxWidth + 10);
    doc.setFillColor(...stat.color);
    doc.roundedRect(x, currentY, boxWidth, 30, 3, 3, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value.toString(), x + boxWidth / 2, currentY + 15, { align: 'center' });
    doc.setFontSize(8);
    doc.text(stat.label, x + boxWidth / 2, currentY + 24, { align: 'center' });
  });
  
  currentY += 45;
  
  autoTable(doc, {
    startY: currentY,
    head: [['ID', 'Título', 'Tipo', 'Prioridad']],
    body: config.testCases.map(tc => [tc.id, tc.title.substring(0, 45), tc.type, tc.priority]),
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
  });

  // ========== PAGE 5+: DETAILED CASES ==========
  doc.addPage();
  currentY = margin;
  drawHeader('5. DETALLE DE CASOS DE PRUEBA', 16);
  
  config.testCases.forEach((tc) => {
    addNewPageIfNeeded(70);
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 12, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`${tc.id} - ${tc.title}`, margin + 5, currentY + 8);
    currentY += 17;
    
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Precondiciones:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(tc.preconditions || 'N/A', margin + 35, currentY);
    currentY += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Pasos:', margin, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    tc.steps.forEach((step, i) => {
      addNewPageIfNeeded(8);
      doc.text(`${i + 1}. ${step}`, margin + 5, currentY);
      currentY += 5;
    });
    currentY += 3;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Resultado:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(tc.expectedResult, margin + 25, currentY);
    currentY += 12;
  });

  // ========== MATRIX ==========
  doc.addPage();
  currentY = margin;
  drawHeader('6. MATRIZ DE TRAZABILIDAD', 16);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Caso', 'Requisito', 'Tipo', 'Prioridad', 'Estado']],
    body: config.testCases.map(tc => [tc.id, 'REQ-001', tc.type, tc.priority, 'Pendiente']),
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
  });

  // ========== SUMMARY ==========
  currentY = (doc as any).lastAutoTable.finalY + 20;
  addNewPageIfNeeded(60);
  drawHeader('7. RESUMEN EJECUTIVO', 16);
  
  const estimatedTime = Math.ceil(config.testCases.length * 12);
  drawText(`Total de casos: ${stats.total}
Positivos: ${stats.positivos} | Negativos: ${stats.negativos} | Borde: ${stats.borde}
Tiempo estimado de ejecución: ${estimatedTime} minutos (~${(estimatedTime/60).toFixed(1)} horas)`);

  // ========== APPROVALS ==========
  addNewPageIfNeeded(80);
  drawHeader('8. APROBACIONES', 16);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Rol', 'Nombre', 'Firma', 'Fecha']],
    body: [['QA Lead', '', '', ''], ['Tech Lead', '', '', ''], ['Product Owner', '', '', '']],
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    margin: { left: margin, right: margin },
    styles: { minCellHeight: 15 },
  });

  // Save
  const fileName = `TestPlan_${(config.projectName || 'Project').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
}
