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
import { RequirementValidator, validateRequirement } from "@/components/RequirementValidator";
import { GenerationResult } from "@/app/page";
import { useLanguage } from "@/lib/language-context";

interface TestCaseFormProps {
  onGenerate: (requirement: string, context: string, format: string) => void;
  isLoading: boolean;
  triggerGenerate?: number;
}

const MAX_CHARS = 5000;

export function TestCaseForm({ onGenerate, isLoading, triggerGenerate }: TestCaseFormProps) {
  const { t } = useLanguage();
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [format, setFormat] = useState("both");
  const [isComparing, setIsComparing] = useState(false);
  const [showValidator, setShowValidator] = useState(false);

  useEffect(() => {
    if (triggerGenerate && triggerGenerate > 0 && requirement.trim() && !isLoading) {
      const validation = validateRequirement(requirement);
      if (validation.isValid) {
        onGenerate(requirement, context, format);
      }
    }
  }, [triggerGenerate]);

  // Show validator after user starts typing (debounced)
  useEffect(() => {
    if (requirement.length > 10) {
      const timer = setTimeout(() => setShowValidator(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowValidator(false);
    }
  }, [requirement]);

  const handleSubmit = () => {
    if (!requirement.trim()) return;
    
    const validation = validateRequirement(requirement);
    if (!validation.isValid) {
      setShowValidator(true);
      return;
    }
    
    onGenerate(requirement, context, format);
  };

  const handleRequirementChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setRequirement(value);
    }
  };

  const handleSelectTemplate = (templateRequirement: string, templateContext: string) => {
    setRequirement(templateRequirement);
    setContext(templateContext);
    setShowValidator(false);
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
    setShowValidator(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter" && requirement.trim() && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getCharCountColor = () => {
    const percentage = (requirement.length / MAX_CHARS) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 75) return "text-yellow-400";
    return "text-slate-500";
  };

  const validation = validateRequirement(requirement);

  return (
    <div className="space-y-4">
      <TemplatesPanel onSelectTemplate={handleSelectTemplate} />
      <CompareMode onCompare={handleCompare} isLoading={isComparing} />
      
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <h2 className="font-semibold text-white">{t.requirement}</h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-slate-300">
              {t.requirement} <span className="text-red-400">*</span>
            </label>
            <button
              onClick={loadExample}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              {t.loadExample}
            </button>
          </div>
          <Textarea
            placeholder={t.requirementPlaceholder}
            value={requirement}
            onChange={(e) => handleRequirementChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[150px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">{t.tipCtrlEnter}</p>
            <p className={`text-xs ${getCharCountColor()}`}>
              {requirement.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Requirement Validator */}
        <RequirementValidator requirement={requirement} show={showValidator} />

        <div className="space-y-2">
          <label className="text-sm text-slate-300">
            {t.context} <span className="text-slate-500">(opcional)</span>
          </label>
          <Textarea
            placeholder={t.contextPlaceholder}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-[80px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">{t.outputFormat}</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:ring-violet-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="both" className="text-white focus:bg-violet-500/20">
                {t.formatBoth}
              </SelectItem>
              <SelectItem value="table" className="text-white focus:bg-violet-500/20">
                {t.formatTable}
              </SelectItem>
              <SelectItem value="gherkin" className="text-white focus:bg-violet-500/20">
                {t.formatGherkin}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start gap-2 p-3 bg-slate-800/30 rounded-lg">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400">{t.infoTip}</p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!requirement.trim() || isLoading || !validation.isValid}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {t.generatingButton}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              {t.generateButton}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
