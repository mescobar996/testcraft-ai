import jsPDF from 'jspdf';
import { TestCase } from '@/app/page';

interface PDFData {
  testCases: TestCase[];
  gherkin: string;
  summary: string;
  requirement: string;
}

export function generatePDF(data: PDFData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      checkNewPage(lineHeight);
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
    return yPos;
  };

  // ===== HEADER =====
  doc.setFillColor(124, 58, 237); // Violet
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TestCraft AI', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Casos de Prueba Generados', margin, 33);
  
  // Date
  const date = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(date, pageWidth - margin - doc.getTextWidth(date), 33);
  
  yPos = 55;

  // ===== SUMMARY =====
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  addWrappedText(data.summary, margin, yPos, contentWidth);
  yPos += 5;

  // Stats
  const positivos = data.testCases.filter(tc => tc.type === 'Positivo').length;
  const negativos = data.testCases.filter(tc => tc.type === 'Negativo').length;
  const borde = data.testCases.filter(tc => tc.type === 'Borde').length;

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPos, contentWidth, 20, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const statsY = yPos + 13;
  doc.text(`Total: ${data.testCases.length}`, margin + 10, statsY);
  doc.text(`Positivos: ${positivos}`, margin + 50, statsY);
  doc.text(`Negativos: ${negativos}`, margin + 100, statsY);
  doc.text(`Borde: ${borde}`, margin + 150, statsY);
  
  yPos += 30;

  // ===== TEST CASES =====
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Casos de Prueba', margin, yPos);
  yPos += 10;

  data.testCases.forEach((tc, index) => {
    checkNewPage(60);
    
    // Case header with colored badge
    const badgeColor = tc.type === 'Positivo' ? [34, 197, 94] : 
                       tc.type === 'Negativo' ? [239, 68, 68] : [234, 179, 8];
    
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(margin, yPos, 8, 8, 1, 1, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${tc.id} - ${tc.title}`, margin + 12, yPos + 6);
    
    // Priority badge
    const priorityColor = tc.priority === 'Alta' ? [239, 68, 68] :
                          tc.priority === 'Media' ? [234, 179, 8] : [34, 197, 94];
    doc.setFontSize(8);
    doc.setTextColor(priorityColor[0], priorityColor[1], priorityColor[2]);
    doc.text(`[${tc.priority}]`, pageWidth - margin - 20, yPos + 6);
    
    yPos += 12;
    
    // Preconditions
    if (tc.preconditions) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('Precondiciones:', margin + 5, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      addWrappedText(tc.preconditions, margin + 5, yPos, contentWidth - 10, 5);
      yPos += 3;
    }
    
    // Steps
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Pasos:', margin + 5, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    tc.steps.forEach((step, stepIndex) => {
      checkNewPage(10);
      addWrappedText(`${stepIndex + 1}. ${step}`, margin + 10, yPos, contentWidth - 15, 5);
    });
    yPos += 3;
    
    // Expected Result
    checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Resultado Esperado:', margin + 5, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    addWrappedText(tc.expectedResult, margin + 5, yPos, contentWidth - 10, 5);
    
    yPos += 10;
    
    // Separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  });

  // ===== GHERKIN =====
  if (data.gherkin) {
    checkNewPage(40);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Formato Gherkin (BDD)', margin, yPos);
    yPos += 10;
    
    // Gherkin box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(200, 200, 200);
    
    const gherkinLines = data.gherkin.split('\n');
    const gherkinHeight = Math.min(gherkinLines.length * 5 + 10, 150);
    
    doc.roundedRect(margin, yPos, contentWidth, gherkinHeight, 3, 3, 'FD');
    yPos += 8;
    
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(60, 60, 60);
    
    gherkinLines.slice(0, 25).forEach(line => {
      if (yPos < doc.internal.pageSize.getHeight() - margin - 10) {
        // Color keywords
        if (line.trim().startsWith('Feature:') || line.trim().startsWith('Scenario:')) {
          doc.setTextColor(124, 58, 237);
          doc.setFont('courier', 'bold');
        } else if (line.trim().startsWith('Given') || line.trim().startsWith('When') || 
                   line.trim().startsWith('Then') || line.trim().startsWith('And')) {
          doc.setTextColor(34, 197, 94);
          doc.setFont('courier', 'bold');
        } else {
          doc.setTextColor(60, 60, 60);
          doc.setFont('courier', 'normal');
        }
        doc.text(line.substring(0, 90), margin + 5, yPos);
        yPos += 5;
      }
    });
    
    if (gherkinLines.length > 25) {
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text('... (ver más en la aplicación)', margin + 5, yPos);
    }
  }

  // ===== FOOTER =====
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generado con TestCraft AI - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `casos-de-prueba-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
