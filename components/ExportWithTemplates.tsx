"use client";

import { useState } from "react";
import { TestCase } from "@/app/page";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/components/Toast";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  X,
  Eye,
  Sparkles,
  ChevronDown
} from "lucide-react";
import * as XLSX from 'xlsx';
import {
  getAllTemplates,
  applyTemplate,
  generateFilename,
  ExportTemplate
} from "@/lib/export-templates";

interface ExportWithTemplatesProps {
  testCases: TestCase[];
  gherkin: string;
  onExportPDF: () => void;
}

export function ExportWithTemplates({ testCases, gherkin, onExportPDF }: ExportWithTemplatesProps) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const templates = getAllTemplates();

  const handleSelectTemplate = (template: ExportTemplate) => {
    setSelectedTemplate(template);

    // Generate preview data
    const data = applyTemplate(template, testCases.slice(0, 3)); // Preview first 3 cases
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleExport = async (template: ExportTemplate) => {
    const data = applyTemplate(template, testCases);
    const filename = generateFilename(template);

    try {
      if (template.format === 'json') {
        // JSON export
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        downloadBlob(blob, filename);
      } else if (template.format === 'csv') {
        // CSV export
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        downloadBlob(blob, filename);
      } else {
        // Excel export
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        downloadBlob(blob, filename);
      }

      showToast(
        `${language === "es" ? "Exportado" : "Exported"}: ${template.name}`,
        "success"
      );
      setIsOpen(false);
      setShowPreview(false);

      // Track export
      if (typeof window !== 'undefined') {
        const { trackExport } = await import('@/lib/analytics');
        const format = template.format === 'xlsx' ? 'excel' : template.format === 'json' ? 'gherkin' : 'gherkin';
        trackExport(null, format as any);
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast(
        language === "es" ? "Error al exportar" : "Export error",
        "error"
      );
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx': return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
      case 'json': return <FileJson className="w-4 h-4 text-yellow-400" />;
      case 'csv': return <FileText className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
      >
        <Sparkles className="w-4 h-4" />
        {language === "es" ? "Exportar con Plantilla" : "Export with Template"}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {language === "es" ? "Exportar con Plantillas" : "Export with Templates"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {testCases.length} {language === "es" ? "casos de prueba" : "test cases"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPreview(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!showPreview ? (
              /* Template Selection */
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-2">
                    {language === "es" ? "Plantillas Predefinidas" : "Built-in Templates"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === "es"
                      ? "Selecciona una plantilla optimizada para tu herramienta de testing"
                      : "Select a template optimized for your testing tool"}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 hover:bg-slate-800 rounded-lg transition-all text-left group"
                    >
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {getFormatIcon(template.format)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">{template.name}</h4>
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase">
                            {template.format}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
                        {template.isCustom && (
                          <span className="inline-block mt-2 text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">
                            {language === "es" ? "Personalizado" : "Custom"}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick exports */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">
                    {language === "es" ? "Exportación Rápida" : "Quick Export"}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={onExportPDF}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 hover:border-red-500/50 text-white rounded-lg transition-all text-sm"
                    >
                      <FileText className="w-4 h-4 text-red-400" />
                      PDF
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([gherkin], { type: 'text/plain' });
                        downloadBlob(blob, `gherkin-${Date.now()}.feature`);
                        showToast(language === "es" ? "Gherkin exportado" : "Gherkin exported", "success");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 hover:border-green-500/50 text-white rounded-lg transition-all text-sm"
                    >
                      <FileText className="w-4 h-4 text-green-400" />
                      Gherkin
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview and Export */
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedTemplate?.name}</h3>
                    <p className="text-sm text-slate-400">{selectedTemplate?.description}</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    ← {language === "es" ? "Cambiar plantilla" : "Change template"}
                  </button>
                </div>

                {/* Preview */}
                <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-96 overflow-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">
                      {language === "es" ? "Vista Previa" : "Preview"}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({language === "es" ? "Primeros 3 casos" : "First 3 cases"})
                    </span>
                  </div>

                  {selectedTemplate?.format === 'json' ? (
                    <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700">
                            {selectedTemplate?.columns.map(col => (
                              <th key={col.header} className="px-2 py-2 text-left font-medium text-slate-300">
                                {col.header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-800/50">
                              {Object.values(row).map((cell: any, cellIdx) => (
                                <td key={cellIdx} className="px-2 py-2 text-slate-400 max-w-xs truncate">
                                  {String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Export Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => selectedTemplate && handleExport(selectedTemplate)}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {language === "es" ? "Exportar" : "Export"} {testCases.length} {language === "es" ? "casos" : "cases"}
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
                  >
                    {language === "es" ? "Cancelar" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
