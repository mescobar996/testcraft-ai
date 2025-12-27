"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/language-context";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Settings2,
  Lightbulb,
} from "lucide-react";

interface TestCaseFormProps {
  onGenerate: (requirement: string, context: string, format: string) => void;
  isLoading: boolean;
  triggerGenerate?: number;
}

const TEMPLATES = [
  {
    id: "login",
    name: "Sistema de Login",
    requirement: "Como usuario quiero poder iniciar sesión en el sistema con mi email y contraseña para acceder a mi cuenta personal.",
    context: "Aplicación web con autenticación, validación de campos, manejo de errores y bloqueo después de 3 intentos fallidos."
  },
  {
    id: "cart",
    name: "Carrito de Compras",
    requirement: "Como cliente quiero agregar productos al carrito de compras para poder realizar una compra.",
    context: "E-commerce con stock limitado, descuentos, múltiples cantidades y eliminación de productos."
  },
  {
    id: "register",
    name: "Registro de Usuario",
    requirement: "Como visitante quiero registrarme en la plataforma con mis datos personales para crear una cuenta nueva.",
    context: "Formulario con validación de email único, contraseña segura, confirmación de contraseña y términos y condiciones."
  },
  {
    id: "search",
    name: "Búsqueda con Filtros",
    requirement: "Como usuario quiero buscar productos aplicando filtros para encontrar lo que necesito rápidamente.",
    context: "Búsqueda con filtros por categoría, precio, disponibilidad, ordenamiento y paginación de resultados."
  },
  {
    id: "payment",
    name: "Proceso de Pago",
    requirement: "Como cliente quiero completar el pago de mi pedido para finalizar la compra.",
    context: "Checkout con múltiples métodos de pago, validación de tarjeta, dirección de envío y confirmación de pedido."
  },
  {
    id: "profile",
    name: "Editar Perfil",
    requirement: "Como usuario quiero editar mi información de perfil para mantener mis datos actualizados.",
    context: "Edición de nombre, email, foto de perfil, contraseña con validaciones y confirmación de cambios."
  },
];

export function TestCaseForm({ onGenerate, isLoading, triggerGenerate }: TestCaseFormProps) {
  const { t } = useLanguage();
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [format, setFormat] = useState("both");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (triggerGenerate && triggerGenerate > 0 && requirement.trim()) {
      onGenerate(requirement, context, format);
    }
  }, [triggerGenerate, requirement, context, format, onGenerate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) return;
    onGenerate(requirement, context, format);
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setRequirement(template.requirement);
    setContext(template.context);
    setShowTemplates(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
            <h3 className="text-white font-semibold text-sm sm:text-base">{t.requirement}</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-slate-400 hover:text-white text-xs sm:text-sm"
          >
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t.predefinedTemplates}</span>
            <span className="sm:hidden">Templates</span>
            {showTemplates ? (
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
            )}
          </Button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2 sm:p-3 bg-slate-800/50 rounded-lg animate-in fade-in slide-in-from-top-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="text-left p-2 sm:p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-all text-xs sm:text-sm"
              >
                <span className="text-white font-medium block text-sm sm:text-base">{template.name}</span>
                <span className="text-slate-400 text-[10px] sm:text-xs line-clamp-2">{template.requirement.substring(0, 60)}...</span>
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder={t.requirementPlaceholder}
          className="min-h-[100px] sm:min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none text-sm sm:text-base"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-full justify-between text-xs sm:text-sm transition-all duration-200 ${
            showAdvanced 
              ? "bg-violet-500/10 border-violet-500/50 text-violet-300" 
              : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
          }`}
        >
          <span className="flex items-center gap-1 sm:gap-2">
            <Settings2 className="w-3 h-3 sm:w-4 sm:h-4" />
            {t.advancedOptions}
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </Button>

        {showAdvanced && (
          <div className="space-y-3 sm:space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-xs sm:text-sm text-slate-300 mb-2 block">{t.context}</label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t.contextPlaceholder}
                className="min-h-[70px] sm:min-h-[80px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm text-slate-300 mb-2 block">{t.outputFormat}</label>
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  { value: "table", label: t.formatTable },
                  { value: "gherkin", label: t.formatGherkin },
                  { value: "both", label: t.formatBoth },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      format === option.value
                        ? "bg-violet-500/20 border-violet-500/50 text-violet-300 border"
                        : "bg-slate-800 border-slate-700 text-slate-400 border hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={!requirement.trim() || isLoading}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-4 sm:py-5 md:py-6 text-base sm:text-lg shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              {t.generatingButton}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t.generateButton}
            </>
          )}
        </Button>

        <p className="text-[10px] sm:text-xs text-slate-500 text-center">{t.tipCtrlEnter}</p>
      </div>
    </form>
  );
}
