"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  score: number;
  level: "excellent" | "good" | "warning" | "error";
  messages: string[];
  suggestions: string[];
}

interface RequirementValidatorProps {
  requirement: string;
  show: boolean;
}

export function validateRequirement(requirement: string): ValidationResult {
  const text = requirement.trim();
  const messages: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Length check
  if (text.length === 0) {
    return {
      isValid: false,
      score: 0,
      level: "error",
      messages: ["El campo está vacío"],
      suggestions: ["Ingresá una descripción del requisito o historia de usuario"],
    };
  }

  if (text.length < 30) {
    messages.push("Requisito muy corto");
    suggestions.push("Agregá más detalles para obtener mejores casos de prueba");
  } else if (text.length < 100) {
    score += 10;
    messages.push("Longitud básica");
    suggestions.push("Considerá agregar criterios de aceptación");
  } else if (text.length < 300) {
    score += 25;
  } else {
    score += 35;
  }

  // Check for user story format
  const hasUserStoryFormat = /como\s+(un\s+)?usuario|as\s+a\s+user|quiero|want\s+to|para\s+que|so\s+that/i.test(text);
  if (hasUserStoryFormat) {
    score += 15;
  } else {
    suggestions.push("Tip: Usar formato 'Como [usuario], quiero [acción] para [beneficio]'");
  }

  // Check for acceptance criteria
  const hasCriteria = /criterios?|acceptance|validaci[oó]n|debe|should|must|required/i.test(text);
  if (hasCriteria) {
    score += 20;
  } else {
    suggestions.push("Agregá criterios de aceptación para mayor precisión");
  }

  // Check for specific actions/verbs
  const hasActions = /click|ingresar|seleccionar|enviar|guardar|eliminar|editar|crear|login|registr/i.test(text);
  if (hasActions) {
    score += 10;
  }

  // Check for validation rules
  const hasValidations = /v[aá]lid|format|m[ií]nimo|m[aá]ximo|obligatori|requerid|error|mensaje/i.test(text);
  if (hasValidations) {
    score += 10;
  }

  // Check for edge cases mentions
  const hasEdgeCases = /borde|edge|l[ií]mite|vac[ií]o|empty|nulo|null|especial|invalid/i.test(text);
  if (hasEdgeCases) {
    score += 10;
  }

  // Determine level
  let level: ValidationResult["level"];
  if (score >= 70) {
    level = "excellent";
    messages.push("Requisito bien detallado");
  } else if (score >= 45) {
    level = "good";
    messages.push("Requisito aceptable");
  } else if (score >= 20) {
    level = "warning";
    messages.push("Requisito básico");
  } else {
    level = "error";
    messages.push("Requisito insuficiente");
  }

  return {
    isValid: score >= 20,
    score: Math.min(score, 100),
    level,
    messages,
    suggestions: suggestions.slice(0, 2),
  };
}

export function RequirementValidator({ requirement, show }: RequirementValidatorProps) {
  const validation = useMemo(() => validateRequirement(requirement), [requirement]);

  if (!show || requirement.trim().length === 0) return null;

  const levelConfig = {
    excellent: {
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      barColor: "bg-green-500",
    },
    good: {
      icon: CheckCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      barColor: "bg-blue-500",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      barColor: "bg-yellow-500",
    },
    error: {
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      barColor: "bg-red-500",
    },
  };

  const config = levelConfig[validation.level];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 space-y-2 animate-in fade-in duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {validation.messages[0]}
          </span>
        </div>
        <span className={`text-xs ${config.color}`}>
          {validation.score}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${config.barColor} transition-all duration-500`}
          style={{ width: `${validation.score}%` }}
        />
      </div>

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="space-y-1">
          {validation.suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
