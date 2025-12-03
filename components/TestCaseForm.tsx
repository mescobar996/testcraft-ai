"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Wand2, Info } from "lucide-react";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { CompareMode } from "@/components/CompareMode";
import { GenerationResult } from "@/app/page";

interface TestCaseFormProps {
  onGenerate: (requirement: string, context: string, format: string) => void;
  isLoading: boolean;
  triggerGenerate?: number;
}

export function TestCaseForm({ onGenerate, isLoading, triggerGenerate }: TestCaseFormProps) {
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [format, setFormat] = useState("both");
  const [isComparing, setIsComparing] = useState(false);

  // Escuchar trigger de generación desde atajos de teclado
  useEffect(() => {
    if (triggerGenerate && triggerGenerate > 0 && requirement.trim() && !isLoading) {
      onGenerate(requirement, context, format);
    }
  }, [triggerGenerate]);

  const handleSubmit = () => {
    if (!requirement.trim()) return;
    onGenerate(requirement, context, format);
  };

  const handleSelectTemplate = (templateRequirement: string, templateContext: string) => {
    setRequirement(templateRequirement);
    setContext(templateContext);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompare = async (req1: string, req2: string, ctx: string): Promise<{
    version1: GenerationResult;
    version2: GenerationResult;
  }> => {
    setIsComparing(true);
    
    try {
      const response1 = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: req1, context: ctx, format: "both" }),
      });
      const version1 = await response1.json();

      const response2 = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement: req2, context: ctx, format: "both" }),
      });
      const version2 = await response2.json();

      return { version1, version2 };
    } finally {
      setIsComparing(false);
    }
  };

  const loadExample = () => {
    setRequirement(`Como usuario registrado, quiero poder iniciar sesión en la aplicación con mi email y contraseña.

Criterios de aceptación:
- El formulario debe tener campos para email y contraseña
- El email debe tener formato válido
- La contraseña debe tener mínimo 8 caracteres
- Mostrar mensaje de error si las credenciales son incorrectas
- Redirigir al dashboard después de login exitoso
- Opción "Recordarme" para mantener la sesión activa`);
    setContext("Aplicación web en React. Autenticación con JWT. Base de datos PostgreSQL.");
  };

  // Manejar Ctrl+Enter en textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter" && requirement.trim() && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Templates Panel */}
      <TemplatesPanel onSelectTemplate={handleSelectTemplate} />

      {/* Compare Mode */}
      <CompareMode onCompare={handleCompare} isLoading={isComparing} />
      
      {/* Main Form */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">Requisito o Historia de Usuario</h2>
        </div>

        {/* Requirement Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">
              Descripción del requisito <span className="text-red-400">*</span>
            </label>
            <button
              onClick={loadExample}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Cargar ejemplo
            </button>
          </div>
          <Textarea
            placeholder="Pegá aquí tu historia de usuario, requisito funcional o descripción de la funcionalidad a probar..."
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[150px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
          />
          <p className="text-xs text-slate-500">
            Tip: Presioná <kbd className="px-1 py-0.5 bg-slate-700 rounded text-violet-400">Ctrl + Enter</kbd> para generar
          </p>
        </div>

        {/* Context Field */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">
            Contexto adicional <span className="text-slate-500">(opcional)</span>
          </label>
          <Textarea
            placeholder="Información adicional: tecnologías usadas, restricciones, reglas de negocio..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-[80px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
          />
        </div>

        {/* Format Select */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Formato de salida</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:ring-violet-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="both" className="text-white focus:bg-violet-500/20">
                Tabla + Gherkin (Recomendado)
              </SelectItem>
              <SelectItem value="table" className="text-white focus:bg-violet-500/20">
                Solo Tabla
              </SelectItem>
              <SelectItem value="gherkin" className="text-white focus:bg-violet-500/20">
                Solo Gherkin
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 bg-slate-800/30 rounded-lg">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400">
            Mientras más detallado sea el requisito, mejores serán los casos de prueba generados. 
            Incluí criterios de aceptación, validaciones y reglas de negocio si las tenés.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!requirement.trim() || isLoading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Generando casos de prueba...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Generar Casos de Prueba
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
