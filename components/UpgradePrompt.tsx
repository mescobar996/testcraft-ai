"use client";

import { useState } from "react";
import { X, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  usageCount: number;
  maxUsage: number;
  onClose?: () => void;
}

export function UpgradePrompt({ usageCount, maxUsage, onClose }: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const percentage = (usageCount / maxUsage) * 100;

  // Solo mostrar en 80%, 90%, o 100%
  const shouldShow = percentage >= 80 && !isDismissed;

  if (!shouldShow || maxUsage === Infinity) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onClose?.();
  };

  // Determinar severidad
  const getSeverity = () => {
    if (percentage >= 100) return "critical";
    if (percentage >= 90) return "warning";
    return "info";
  };

  const severity = getSeverity();

  const getConfig = () => {
    switch (severity) {
      case "critical":
        return {
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          iconColor: "text-red-400",
          title: "¡Límite alcanzado!",
          message: `Has usado todas tus ${maxUsage} generaciones mensuales. Actualiza a Pro para continuar.`,
          ctaText: "Actualizar a Pro",
          ctaColor: "bg-red-600 hover:bg-red-500"
        };
      case "warning":
        return {
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          iconColor: "text-yellow-400",
          title: "Te estás quedando sin generaciones",
          message: `Has usado ${usageCount} de ${maxUsage} generaciones este mes. Actualiza a Pro para 500/mes.`,
          ctaText: "Ver Planes Pro",
          ctaColor: "bg-yellow-600 hover:bg-yellow-500"
        };
      default:
        return {
          bgColor: "bg-violet-500/10",
          borderColor: "border-violet-500/30",
          iconColor: "text-violet-400",
          title: "Vas por buen camino",
          message: `Has usado ${usageCount} de ${maxUsage} generaciones. Con Pro obtienes 500/mes y más features.`,
          ctaText: "Conocer Pro",
          ctaColor: "bg-violet-600 hover:bg-violet-500"
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`fixed bottom-6 right-6 max-w-md z-50 animate-slideUp`}>
      <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 shadow-xl backdrop-blur-sm`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${config.iconColor}`} />
            <h3 className="font-semibold text-white">{config.title}</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Uso mensual</span>
            <span className="font-mono">{usageCount}/{maxUsage}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                severity === "critical"
                  ? "bg-red-500"
                  : severity === "warning"
                  ? "bg-yellow-500"
                  : "bg-violet-500"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-300 mb-4">
          {config.message}
        </p>

        {/* Benefits Preview */}
        <div className="space-y-2 mb-4 p-3 bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span>500 generaciones/mes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Zap className="w-3 h-3 text-violet-400" />
            <span>Exportación avanzada (Gherkin, JSON)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Plantillas personalizadas</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link
            href="/pricing"
            className={`flex-1 px-4 py-2 ${config.ctaColor} text-white text-sm font-medium rounded-lg transition-colors text-center`}
          >
            {config.ctaText}
          </Link>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
          >
            Luego
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
