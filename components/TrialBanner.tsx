"use client";

import { useState } from "react";
import { Sparkles, Clock, X, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function TrialBanner() {
  const { user, isPro, isProTrial, trialInfo, startTrial } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // No mostrar si no hay usuario, es Pro, está en trial, o fue dismissed
  if (!user || isPro || isProTrial || isDismissed) return null;

  // No mostrar si ya usó el trial
  if (trialInfo && !trialInfo.isEligible) return null;

  const handleStartTrial = () => {
    setIsStarting(true);
    const success = startTrial();

    if (success) {
      // Trial iniciado exitosamente, el banner se ocultará automáticamente
      setTimeout(() => {
        window.location.reload(); // Recargar para actualizar toda la UI
      }, 1000);
    } else {
      setIsStarting(false);
      alert('No pudimos iniciar el trial. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-violet-600/20 border border-violet-500/30 rounded-xl p-4 mb-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" />
              Oferta Especial
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Prueba Pro Gratis por 14 Días
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Accede a <strong>500 generaciones/mes</strong>, exportación avanzada (Gherkin, JSON), plantillas personalizadas y más. Sin tarjeta de crédito.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                500 generaciones por mes
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                Exportación avanzada (Gherkin, JSON)
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                Plantillas personalizadas
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full"></div>
                Soporte prioritario
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleStartTrial}
                disabled={isStarting}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Comenzar Trial Gratuito
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Sin compromiso • Cancela cuando quieras
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Trial Status Badge - Muestra el estado del trial activo
 */
export function TrialStatusBadge() {
  const { isProTrial, trialInfo } = useAuth();

  if (!isProTrial || !trialInfo) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-lg">
      <Sparkles className="w-4 h-4 text-violet-400" />
      <span className="text-sm font-medium text-violet-300">
        Trial Pro • {trialInfo.daysRemaining} días restantes
      </span>
    </div>
  );
}
