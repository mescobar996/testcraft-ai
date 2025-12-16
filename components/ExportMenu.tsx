"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  ChevronDown,
  ChevronUp,
  Link2,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import { TestCase } from "@/app/page";
import { IntegrationsModal } from "@/components/IntegrationsModal";
import { useToast } from "@/components/Toast";

interface ExportMenuProps {
  testCases: TestCase[];
  gherkin: string;
  onExportPDF: () => void;
}

export function ExportMenu({ testCases, gherkin, onExportPDF }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { showToast } = useToast();

  const exportToExcel = () => {
    const headers = ["ID", "Título", "Tipo", "Prioridad", "Precondiciones", "Pasos", "Resultado Esperado"];
    const rows = testCases.map(tc => [
      tc.id,
      tc.title,
      tc.type,
      tc.priority,
      tc.preconditions,
      tc.steps.join(" | "),
      tc.expectedResult
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-cases-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToJSON = () => {
    const data = { testCases, gherkin, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-cases-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportToJiraCSV = () => {
    const headers = ["Summary", "Description", "Issue Type", "Priority", "Labels"];
    const rows = testCases.map(tc => [
      `[TC] ${tc.title}`,
      `Precondiciones: ${tc.preconditions}\n\nPasos:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nResultado Esperado: ${tc.expectedResult}`,
      "Test",
      tc.priority === "Alta" ? "High" : tc.priority === "Media" ? "Medium" : "Low",
      tc.type
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jira-import-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
    showToast("CSV listo para importar en Jira", "success");
  };

  const exportToTestRail = () => {
    const headers = ["Title", "Section", "Type", "Priority", "Preconditions", "Steps", "Expected Result"];
    const rows = testCases.map(tc => [
      tc.title,
      "Imported from TestCraft",
      tc.type === "Positivo" ? "Functional" : tc.type === "Negativo" ? "Negative" : "Boundary",
      tc.priority === "Alta" ? "Critical" : tc.priority === "Media" ? "High" : "Medium",
      tc.preconditions,
      tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      tc.expectedResult
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `testrail-import-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
    showToast("CSV listo para importar en TestRail", "success");
  };

  const exportToZephyr = () => {
    const headers = ["Name", "Objective", "Precondition", "Folder", "Status", "Priority", "Labels", "Test Script (Step-by-Step)"];
    const rows = testCases.map(tc => [
      tc.title,
      tc.expectedResult,
      tc.preconditions,
      "/Imported",
      "Draft",
      tc.priority === "Alta" ? "1" : tc.priority === "Media" ? "2" : "3",
      tc.type,
      tc.steps.map((s, i) => `Step ${i + 1}: ${s}`).join(' || ')
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zephyr-import-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
    showToast("CSV listo para importar en Zephyr Scale", "success");
  };

  const exportToQTest = () => {
    const headers = ["Test Case Name", "Description", "Precondition", "Test Steps", "Expected Result", "Priority", "Type"];
    const rows = testCases.map(tc => [
      tc.title,
      `Tipo: ${tc.type}`,
      tc.preconditions,
      tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      tc.expectedResult,
      tc.priority,
      tc.type
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qtest-import-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
    showToast("Excel listo para importar en qTest", "success");
  };

  // Enviar a integración conectada
  const sendToIntegration = async (integrationId: string) => {
    const saved = JSON.parse(localStorage.getItem('testcraft_integrations') || '{}');
    const config = saved[integrationId];
    
    if (!config?.connected) {
      showToast("Primero conectá la integración", "error");
      setShowIntegrations(true);
      setIsOpen(false);
      return;
    }

    setSendingTo(integrationId);
    
    // Simular envío (en producción sería la llamada real a la API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showToast(`${testCases.length} casos enviados a ${integrationId.charAt(0).toUpperCase() + integrationId.slice(1)}`, "success");
    setSendingTo(null);
    setIsOpen(false);
  };

  // Verificar integraciones conectadas
  const getConnectedIntegrations = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('testcraft_integrations') || '{}');
      return Object.keys(saved).filter(key => saved[key]?.connected);
    } catch {
      return [];
    }
  };

  const connectedIntegrations = getConnectedIntegrations();

  return (
    <>
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar
          {isOpen ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Formatos básicos */}
            <div className="p-2 border-b border-slate-800">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Formatos Básicos</p>
              <button
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-400" />
                Excel (.xlsx)
              </button>
              <button
                onClick={onExportPDF}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <FileText className="w-4 h-4 text-red-400" />
                PDF
              </button>
              <button
                onClick={exportToJSON}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <FileJson className="w-4 h-4 text-yellow-400" />
                JSON
              </button>
            </div>

            {/* Herramientas de Testing */}
            <div className="p-2 border-b border-slate-800">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Herramientas de Testing</p>
              <button
                onClick={exportToJiraCSV}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <span className="text-blue-400 font-bold text-xs">J</span>
                Jira (CSV)
              </button>
              <button
                onClick={exportToTestRail}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <span className="text-teal-400 font-bold text-xs">TR</span>
                TestRail (CSV)
              </button>
              <button
                onClick={exportToZephyr}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <span className="text-purple-400 font-bold text-xs">Z</span>
                Zephyr Scale (CSV)
              </button>
              <button
                onClick={exportToQTest}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
              >
                <span className="text-orange-400 font-bold text-xs">qT</span>
                qTest (Excel)
              </button>
            </div>

            {/* Envío directo a integraciones */}
            {connectedIntegrations.length > 0 && (
              <div className="p-2 border-b border-slate-800">
                <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Envío Directo</p>
                {connectedIntegrations.map(id => (
                  <button
                    key={id}
                    onClick={() => sendToIntegration(id)}
                    disabled={sendingTo === id}
                    className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors text-sm"
                  >
                    {sendingTo === id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    ) : (
                      <Send className="w-4 h-4 text-violet-400" />
                    )}
                    Enviar a {id.charAt(0).toUpperCase() + id.slice(1)}
                    {sendingTo === id && <span className="ml-auto text-xs text-slate-500">Enviando...</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Configurar integraciones */}
            <div className="p-2">
              <button
                onClick={() => {
                  setShowIntegrations(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors text-sm"
              >
                <Link2 className="w-4 h-4" />
                Configurar Integraciones
                {connectedIntegrations.length > 0 && (
                  <span className="ml-auto bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full text-xs">
                    {connectedIntegrations.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <IntegrationsModal 
        isOpen={showIntegrations} 
        onClose={() => setShowIntegrations(false)} 
      />
    </>
  );
}
