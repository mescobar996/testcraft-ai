"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Loader2,
  X,
  User,
  Calendar,
  FolderOpen,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { TestCase } from "@/app/page";

interface TestPlanModalProps {
  testCases: TestCase[];
  requirement: string;
  gherkin?: string;
  summary?: string;
}

export function TestPlanModal({ testCases, requirement, gherkin, summary }: TestPlanModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [version, setVersion] = useState("1.0");
  const [author, setAuthor] = useState("");
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      showToast("Ingresá el nombre del proyecto", "error");
      return;
    }

    setIsGenerating(true);

    try {
      const { generateTestPlanPDF } = await import("@/lib/generate-test-plan-pdf");
      
      const fileName = generateTestPlanPDF({
        projectName,
        version,
        author: author || "QA Team",
        date: new Date().toLocaleDateString("es-AR"),
        requirement,
        testCases,
        gherkin,
        summary,
      });

      showToast(`Test Plan generado: ${fileName}`, "success");
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error al generar el Test Plan", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (testCases.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      >
        <FileText className="w-4 h-4 mr-2" />
        Test Plan PDF
        <Sparkles className="w-3 h-3 ml-2 text-yellow-400" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Generar Test Plan</h2>
                  <p className="text-sm text-slate-400">Documento PDF profesional</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Preview info */}
              <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{testCases.length} casos de prueba</p>
                    <p className="text-slate-400 text-xs">Serán incluidos en el documento</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm font-medium">~{Math.ceil(testCases.length * 12)} min</p>
                  <p className="text-slate-400 text-xs">Tiempo estimado</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-300 mb-1.5 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Nombre del Proyecto *
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ej: Sistema de Login"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Versión
                    </label>
                    <Input
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Autor
                    </label>
                    <Input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="QA Team"
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* What's included */}
              <div className="bg-slate-800/30 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-2 font-medium">El documento incluye:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                  <span>✓ Portada profesional</span>
                  <span>✓ Índice</span>
                  <span>✓ Info del proyecto</span>
                  <span>✓ Alcance y objetivos</span>
                  <span>✓ Requisito analizado</span>
                  <span>✓ Resumen de casos</span>
                  <span>✓ Detalle completo</span>
                  <span>✓ Matriz trazabilidad</span>
                  <span>✓ Resumen ejecutivo</span>
                  <span>✓ Hoja de aprobaciones</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-800/30">
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="text-slate-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!projectName.trim() || isGenerating}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Test Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
