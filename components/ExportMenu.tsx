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
} from "lucide-react";
import { TestCase } from "@/app/page";
import { useToast } from "@/components/Toast";

interface ExportMenuProps {
  testCases: TestCase[];
  gherkin: string;
  onExportPDF: () => void;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export function ExportMenu({ testCases, gherkin, onExportPDF }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

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

  return (
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
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2 border-b border-slate-800">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Formatos Básicos</p>
              <button onClick={exportToExcel} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <FileSpreadsheet className="w-4 h-4 text-green-400" /> Excel (.xlsx)
              </button>
              <button onClick={() => { onExportPDF(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <FileText className="w-4 h-4 text-red-400" /> PDF
              </button>
              <button onClick={exportToJSON} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <FileJson className="w-4 h-4 text-yellow-400" /> JSON
              </button>
            </div>

            <div className="p-2">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wider">Herramientas de Testing</p>
              <button onClick={exportToJiraCSV} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="w-4 text-blue-400 font-bold text-xs">J</span> Jira (CSV)
              </button>
              <button onClick={exportToTestRail} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="w-4 text-teal-400 font-bold text-xs">TR</span> TestRail (CSV)
              </button>
              <button onClick={exportToZephyr} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="w-4 text-purple-400 font-bold text-xs">Z</span> Zephyr Scale (CSV)
              </button>
              <button onClick={exportToQTest} className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm">
                <span className="w-4 text-orange-400 font-bold text-xs">qT</span> qTest (Excel)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
