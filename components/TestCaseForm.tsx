"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/language-context";
import { RequirementValidator } from "./RequirementValidator";
import {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{t.requirement}</h3>
              <p className="text-[11px] text-zinc-500">Describí la funcionalidad a probar</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-zinc-500 hover:text-white text-xs"
          >
            <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
            Templates
            {showTemplates ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </Button>
        </div>

        {/* Templates Grid */}
        {showTemplates && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="text-left p-2.5 bg-white/[0.04] hover:bg-white/[0.07] rounded-lg border border-white/[0.06] hover:border-violet-500/30 transition-all"
              >
                <span className="text-white font-medium block text-xs">{template.name}</span>
                <span className="text-zinc-500 text-[10px] line-clamp-2 mt-0.5 block">{template.requirement.substring(0, 50)}...</span>
              </button>
            ))}
          </div>
        )}

        {/* Textarea */}
        <Textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder={t.requirementPlaceholder}
          className="min-h-[120px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-violet-500/20 resize-none text-sm rounded-lg"
        />

        {/* Validator feedback */}
        {requirement.trim().length > 10 && (
          <RequirementValidator requirement={requirement} show={true} />
        )}

        {/* Advanced Options */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-zinc-500 hover:text-white w-full justify-between text-xs"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            {t.advancedOptions}
          </span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>

        {showAdvanced && (
          <div className="space-y-4 pt-1">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">{t.context}</label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t.contextPlaceholder}
                className="min-h-[70px] bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-violet-500/20 resize-none text-sm rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">{t.outputFormat}</label>
              <div className="flex gap-2">
                {[
                  { value: "table", label: t.formatTable },
                  { value: "gherkin", label: t.formatGherkin },
                  { value: "both", label: t.formatBoth },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                      format === option.value
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                        : "bg-white/[0.04] border-white/[0.06] text-zinc-500 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={!requirement.trim() || isLoading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium py-5 text-sm rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando casos...
            </>
          ) : (
            <>
              Generar Casos de Prueba
            </>
          )}
        </Button>

        <p className="text-[10px] text-zinc-600 text-center">Ctrl + Enter para generar</p>
      </div>
    </form>
  );
}
