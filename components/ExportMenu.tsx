"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Check,
} from "lucide-react";
import { TestCase } from "@/app/page";
import { IntegrationsModal } from "@/components/IntegrationsModal";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth-context";

interface ExportMenuProps {
  testCases: TestCase[];
  gherkin: string;
  onExportPDF: () => void;
  requirementTitle?: string;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export function ExportMenu({ testCases, gherkin, onExportPDF, requirementTitle }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const { showToast } = useToast();
  const { session, user } = useAuth();

  // Cargar integraciones conectadas
  useEffect(() => {
    if (session?.access_token) {
      loadConnectedIntegrations();
    }
  }, [session]);

  const loadConnectedIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/config', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConnectedIntegrations(data.integrations.map((i: any) => i.integration_id));
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  };

  const exportToExcel = () => {
    const headers = ["ID", "Título", "Tipo", "Prioridad", "Precondiciones", "Pasos", "Resultado Esperado"];
    const rows = testCases.map(tc => [
      tc.id, tc.title, tc.type, tc.priority, tc.preconditions,
      tc.steps.join(" | "), tc.expectedResult
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadBlob(new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" }), `test-cases-${Date.now()}.xlsx`);
    setIsOpen(false);
  };

  const exportToJSON = () => {
    const data = { testCases, gherkin, exportedAt: new Date().toISOString() };
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `test-cases-${Date.now()}.json`);
    setIsOpen(false);
  };

  const exportToJiraCSV = () => {
    const headers = ["Summary", "Description", "Issue Type", "Priority", "Labels"];
    const rows = testCases.map(tc => [
      `[TC] ${tc.title}`,
      `Precondiciones: ${tc.preconditions}\n\nPasos:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nResultado: ${tc.expectedResult}`,
      "Task", tc.priority === "Alta" ? "High" : tc.priority === "Media" ? "Medium" : "Low", tc.type
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" }), `jira-import-${Date.now()}.csv`);
    showToast("CSV listo para importar en Jira", "success");
    setIsOpen(false);
  };

  const exportToTestRail = () => {
    const headers = ["Title", "Section", "Type", "Priority", "Preconditions", "Steps", "Expected Result"];
    const rows = testCases.map(tc => [
      tc.title, "TestCraft Import", tc.type, tc.priority, tc.preconditions,
      tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'), tc.expectedResult
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" }), `testrail-import-${Date.now()}.csv`);
    showToast("CSV listo para TestRail", "success");
    setIsOpen(false);
  };

  const exportToZephyr = () => {
    const headers = ["Name", "Objective", "Precondition", "Folder", "Status", "Priority", "Labels"];
    const rows = testCases.map(tc => [
      tc.title, tc.expectedResult, tc.preconditions, "/Imported", "Draft",
      tc.priority === "Alta" ? "1" : tc.priority === "Media" ? "2" : "3", tc.type
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" }), `zephyr-import-${Date.now()}.csv`);
    showToast("CSV listo para Zephyr Scale", "success");
    setIsOpen(false);
  };

  const exportToQTest = () => {
    const headers = ["Test Case Name", "Description", "Precondition", "Test Steps", "Expected Result", "Priority", "Type"];
    const rows = testCases.map(tc => [
      tc.title, `Tipo: ${tc.type}`, tc.preconditions,
      tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'), tc.expectedResult, tc.priority, tc.type
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" }), `qtest-import-${Date.now()}.xlsx`);
    showToast("Excel listo para qTest", "success");
    setIsOpen(false);
  };

  // Enviar a integración conectada (API REAL)
  const sendToIntegration = async (integrationId: string) => {
    if (!session?.access_token) {
      showToast("Iniciá sesión para usar integraciones", "error");
      return;
    }

    if (!connectedIntegrations.includes(integrationId)) {
      showToast("Primero conectá la integración", "error");
      setShowIntegrations(true);
      setIsOpen(false);
      return;
    }

    setSendingTo(integrationId);

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          testCases,
          requirementTitle 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const name = integrationId.charAt(0).toUpperCase() + integrationId.slice(1);
        
        if (data.results && data.results.length > 0) {
          showToast(
            `✓ ${data.summary.created}/${data.summary.total} casos enviados a ${name}`,
            "success"
          );
          
          // Si hay URLs, mostrar la primera
          if (data.results[0]?.url) {
            setTimeout(() => {
              if (confirm(`¿Abrir ${name} para ver los casos creados?`)) {
                window.open(data.results[0].url, '_blank');
              }
            }, 500);
          }
        } else {
          showToast(`Enviado a ${name}`, "success");
        }

        // Si hubo errores parciales
        if (data.errors && data.errors.length > 0) {
          console.warn('Errores parciales:', data.errors);
          showToast(`${data.errors.length} casos fallaron`, "error");
        }
      } else {
        showToast(data.error || `Error al enviar a ${integrationId}`, "error");
      }
    } catch (error) {
      console.error('Error sending to integration:', error);
      showToast("Error de conexión", "error");
    } finally {
      setSendingTo(null);
      setIsOpen(false);
    }
  };

  const integrationNames: Record<string, { icon: string; name: string }> = {
    jira: { icon: "🔷", name: "Jira" },
    trello: { icon: "📋", name: "Trello" },
    notion: { icon: "📝", name: "Notion" },
    github: { icon: "🐙", name: "GitHub" },
    azure: { icon: "🔵", name: "Azure DevOps" },
    slack: { icon: "💬", name: "Slack" },
  };

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
          {isOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Formatos básicos */}
            <div className="p-2 border-b border-slate-800">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Formatos Básicos</p>
              <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <FileSpreadsheet className="w-4 h-4 text-green-400" /> Excel (.xlsx)
              </button>
              <button onClick={onExportPDF} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <FileText className="w-4 h-4 text-red-400" /> PDF
              </button>
              <button onClick={exportToJSON} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <FileJson className="w-4 h-4 text-yellow-400" /> JSON
              </button>
            </div>

            {/* Herramientas de Testing */}
            <div className="p-2 border-b border-slate-800">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Importar a Herramientas</p>
              <button onClick={exportToJiraCSV} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="text-blue-400 font-bold text-xs w-4">J</span> Jira (CSV)
              </button>
              <button onClick={exportToTestRail} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="text-teal-400 font-bold text-xs w-4">TR</span> TestRail (CSV)
              </button>
              <button onClick={exportToZephyr} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="text-purple-400 font-bold text-xs w-4">Z</span> Zephyr Scale (CSV)
              </button>
              <button onClick={exportToQTest} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="text-orange-400 font-bold text-xs w-4">qT</span> qTest (Excel)
              </button>
            </div>

            {/* Envío directo a integraciones conectadas */}
            {connectedIntegrations.length > 0 && (
              <div className="p-2 border-b border-slate-800">
                <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-400" /> Envío Directo
                </p>
                {connectedIntegrations.map(id => (
                  <button
                    key={id}
                    onClick={() => sendToIntegration(id)}
                    disabled={sendingTo === id}
                    className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {sendingTo === id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                    ) : (
                      <span>{integrationNames[id]?.icon || "🔗"}</span>
                    )}
                    <span className="flex-1 text-left">
                      Enviar a {integrationNames[id]?.name || id}
                    </span>
                    {sendingTo === id && <span className="text-xs text-slate-500">Enviando...</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Configurar integraciones */}
            <div className="p-2">
              <button
                onClick={() => { setShowIntegrations(true); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-violet-400 hover:bg-violet-500/10 rounded-lg text-sm"
              >
                <Link2 className="w-4 h-4" />
                <span className="flex-1 text-left">Configurar Integraciones</span>
                {connectedIntegrations.length > 0 && (
                  <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">
                    {connectedIntegrations.length} activas
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <IntegrationsModal isOpen={showIntegrations} onClose={() => { setShowIntegrations(false); loadConnectedIntegrations(); }} />
    </>
  );
}
