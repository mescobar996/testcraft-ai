"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Settings2,
  Lightbulb,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

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
  }, [triggerGenerate]);

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
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <h3 className="text-white font-semibold">{t.requirement}</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-slate-400 hover:text-white"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Plantillas Predefinidas
            {showTemplates ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-800/50 rounded-lg animate-in fade-in slide-in-from-top-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-all text-sm"
              >
                <span className="text-white font-medium block">{template.name}</span>
                <span className="text-slate-400 text-xs line-clamp-2">{template.requirement.substring(0, 60)}...</span>
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder={t.requirementPlaceholder}
          className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-slate-400 hover:text-white w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Opciones Avanzadas
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {showAdvanced && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Contexto Adicional</label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Información adicional, reglas de negocio, limitaciones..."
                className="min-h-[80px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Formato de Salida</label>
              <div className="flex gap-2">
                {[
                  { value: "table", label: "Solo Tabla" },
                  { value: "gherkin", label: "Solo Gherkin" },
                  { value: "both", label: "Ambos" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-6 text-lg shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {t.generate}
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">Ctrl + Enter para generar rápidamente</p>
      </div>
    </form>
  );
}
