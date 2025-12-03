"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TestCase } from "@/app/page";
import {
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  FileJson,
  Download,
} from "lucide-react";
import {
  exportToJira,
  exportToTestRail,
  exportToZephyr,
  exportToQTest,
  exportToJSON,
} from "@/lib/export-formats";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExportMenuProps {
  testCases: TestCase[];
  gherkin: string;
  onExportPDF: () => void;
}

export function ExportMenu({ testCases, gherkin, onExportPDF }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToExcel = () => {
    const data = testCases.map((tc) => ({
      ID: tc.id,
      Título: tc.title,
      Tipo: tc.type,
      Prioridad: tc.priority,
      Precondiciones: tc.preconditions,
      Pasos: tc.steps.join("\n"),
      "Resultado Esperado": tc.expectedResult,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Casos de Prueba");

    const gherkinWs = XLSX.utils.aoa_to_sheet([[gherkin]]);
    XLSX.utils.book_append_sheet(wb, gherkinWs, "Gherkin");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `casos-de-prueba-${new Date().toISOString().split("T")[0]}.xlsx`);
    setIsOpen(false);
  };

  const handleExport = (format: string) => {
    switch (format) {
      case "excel":
        exportToExcel();
        break;
      case "pdf":
        onExportPDF();
        break;
      case "jira":
        exportToJira(testCases);
        break;
      case "testrail":
        exportToTestRail(testCases);
        break;
      case "zephyr":
        exportToZephyr(testCases);
        break;
      case "qtest":
        exportToQTest(testCases);
        break;
      case "json":
        exportToJSON(testCases);
        break;
    }
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
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wide">Formatos Básicos</p>
              <ExportOption
                icon={<FileSpreadsheet className="w-4 h-4 text-green-400" />}
                label="Excel (.xlsx)"
                onClick={() => handleExport("excel")}
              />
              <ExportOption
                icon={<FileDown className="w-4 h-4 text-red-400" />}
                label="PDF"
                onClick={() => handleExport("pdf")}
              />
              <ExportOption
                icon={<FileJson className="w-4 h-4 text-yellow-400" />}
                label="JSON"
                onClick={() => handleExport("json")}
              />
            </div>
            
            <div className="border-t border-slate-700 p-2">
              <p className="text-xs text-slate-500 px-2 py-1 uppercase tracking-wide">Herramientas de Testing</p>
              <ExportOption
                icon={<span className="text-blue-400 text-xs font-bold">J</span>}
                label="Jira (CSV)"
                onClick={() => handleExport("jira")}
              />
              <ExportOption
                icon={<span className="text-teal-400 text-xs font-bold">TR</span>}
                label="TestRail (CSV)"
                onClick={() => handleExport("testrail")}
              />
              <ExportOption
                icon={<span className="text-purple-400 text-xs font-bold">Z</span>}
                label="Zephyr Scale (CSV)"
                onClick={() => handleExport("zephyr")}
              />
              <ExportOption
                icon={<span className="text-orange-400 text-xs font-bold">qT</span>}
                label="qTest (Excel)"
                onClick={() => handleExport("qtest")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ExportOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors"
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      {label}
    </button>
  );
}
