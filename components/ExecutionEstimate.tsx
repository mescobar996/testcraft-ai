"use client";

import { useMemo } from "react";
import { Clock, Timer, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { TestCase } from "@/app/page";

interface ExecutionEstimateProps {
  testCases: TestCase[];
}

// Tiempo estimado en minutos por tipo y prioridad
const TIME_ESTIMATES = {
  // Por tipo de caso
  type: {
    Positivo: 8,   // Casos positivos suelen ser más directos
    Negativo: 12,  // Casos negativos requieren verificar errores
    Borde: 15,     // Casos de borde son más complejos
  },
  // Multiplicador por prioridad
  priority: {
    Alta: 1.2,     // Casos críticos requieren más atención
    Media: 1.0,    // Tiempo base
    Baja: 0.8,     // Casos simples
  }
};

export function ExecutionEstimate({ testCases }: ExecutionEstimateProps) {
  const estimate = useMemo(() => {
    if (testCases.length === 0) return null;

    let totalMinutes = 0;
    let byPriority = { Alta: 0, Media: 0, Baja: 0 };
    let byType = { Positivo: 0, Negativo: 0, Borde: 0 };

    testCases.forEach(tc => {
      const baseTime = TIME_ESTIMATES.type[tc.type] || 10;
      const multiplier = TIME_ESTIMATES.priority[tc.priority] || 1;
      const caseTime = baseTime * multiplier;
      
      totalMinutes += caseTime;
      byPriority[tc.priority] += caseTime;
      byType[tc.type] += caseTime;
    });

    // Agregar tiempo de setup/teardown (10% del total)
    const setupTime = totalMinutes * 0.1;
    totalMinutes += setupTime;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    return {
      totalMinutes: Math.round(totalMinutes),
      hours,
      minutes,
      formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      byPriority,
      byType,
      casesPerHour: Math.round(60 / (totalMinutes / testCases.length)),
    };
  }, [testCases]);

  if (!estimate) return null;

  const getEffortLevel = () => {
    if (estimate.totalMinutes <= 30) return { label: "Rápido", color: "text-green-400", bg: "bg-green-500/20", icon: Zap };
    if (estimate.totalMinutes <= 120) return { label: "Moderado", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Timer };
    return { label: "Extenso", color: "text-orange-400", bg: "bg-orange-500/20", icon: AlertTriangle };
  };

  const effort = getEffortLevel();
  const EffortIcon = effort.icon;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Estimación de Ejecución</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${effort.bg}`}>
          <EffortIcon className={`w-3 h-3 ${effort.color}`} />
          <span className={`text-xs font-medium ${effort.color}`}>{effort.label}</span>
        </div>
      </div>

      {/* Tiempo total */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-white">{estimate.formatted}</span>
        <span className="text-sm text-slate-400">estimado</span>
      </div>

      {/* Barra de progreso visual */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4 flex">
        {estimate.byPriority.Alta > 0 && (
          <div 
            className="bg-red-500 h-full" 
            style={{ width: `${(estimate.byPriority.Alta / estimate.totalMinutes) * 100}%` }}
            title={`Alta: ${Math.round(estimate.byPriority.Alta)}m`}
          />
        )}
        {estimate.byPriority.Media > 0 && (
          <div 
            className="bg-yellow-500 h-full" 
            style={{ width: `${(estimate.byPriority.Media / estimate.totalMinutes) * 100}%` }}
            title={`Media: ${Math.round(estimate.byPriority.Media)}m`}
          />
        )}
        {estimate.byPriority.Baja > 0 && (
          <div 
            className="bg-green-500 h-full" 
            style={{ width: `${(estimate.byPriority.Baja / estimate.totalMinutes) * 100}%` }}
            title={`Baja: ${Math.round(estimate.byPriority.Baja)}m`}
          />
        )}
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">Alta</span>
          </div>
          <span className="text-sm font-medium text-white">{Math.round(estimate.byPriority.Alta)}m</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-400">Media</span>
          </div>
          <span className="text-sm font-medium text-white">{Math.round(estimate.byPriority.Media)}m</span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400">Baja</span>
          </div>
          <span className="text-sm font-medium text-white">{Math.round(estimate.byPriority.Baja)}m</span>
        </div>
      </div>

      {/* Info adicional */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>~{estimate.casesPerHour} casos/hora</span>
        <span>Incluye setup/teardown</span>
      </div>
    </div>
  );
}
