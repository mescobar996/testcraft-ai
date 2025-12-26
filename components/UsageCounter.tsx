"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Zap, Infinity as InfinityIcon, Crown, Sparkles } from "lucide-react";

export function UsageCounter() {
  const { user, usageCount, maxUsage, isPro, isProTrial, trialInfo } = useAuth();
  const { language } = useLanguage();

  // --- CORRECCIÓN DE HIDRATACIÓN ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // ---------------------------------

  // Determinar si tiene acceso ilimitado (Pro o Trial activo)
  const hasUnlimitedAccess = isPro || isProTrial;
  const remaining = hasUnlimitedAccess ? Infinity : maxUsage - usageCount;
  const percentage = hasUnlimitedAccess ? 0 : (usageCount / maxUsage) * 100;

  const getPlanLabel = () => {
    if (isPro) return language === "es" ? "Plan Pro" : "Pro Plan";
    if (isProTrial) return language === "es" ? "Trial Pro" : "Pro Trial";
    if (user) return language === "es" ? "Plan Free" : "Free Plan";
    return language === "es" ? "Anónimo" : "Anonymous";
  };

  const getText = () => {
    if (isPro) {
      return language === "es" ? "Ilimitado" : "Unlimited";
    }
    if (isProTrial) {
      return language === "es"
        ? `Ilimitado (${trialInfo?.daysRemaining || 0}d restantes)`
        : `Unlimited (${trialInfo?.daysRemaining || 0}d left)`;
    }
    if (!user) {
      return language === "es"
        ? `${remaining} de ${maxUsage} diarias`
        : `${remaining} of ${maxUsage} daily`;
    }
    return language === "es"
      ? `${remaining} de ${maxUsage} mensuales`
      : `${remaining} of ${maxUsage} monthly`;
  };

  const getColor = () => {
    if (isPro) return "text-violet-400";
    if (isProTrial) return "text-purple-400";
    if (remaining <= 1) return "text-red-400";
    if (remaining <= 3) return "text-yellow-400";
    return "text-slate-400";
  };

  const getBarColor = () => {
    if (isPro) return "bg-violet-500";
    if (isProTrial) return "bg-purple-500";
    if (remaining <= 1) return "bg-red-500";
    if (remaining <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getIcon = () => {
    if (isPro) return <Crown className="w-4 h-4 text-violet-400" />;
    if (isProTrial) return <Sparkles className="w-4 h-4 text-purple-400" />;
    return <Zap className={`w-4 h-4 ${getColor()}`} />;
  };

  // Si no ha montado, retornamos un esqueleto rectangular para que no "salte" el diseño
  if (!mounted) {
    return (
      <div className="h-14 w-40 bg-slate-800/50 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg animate-in fade-in duration-300">
      {getIcon()}

      <div className="flex flex-col min-w-[120px]">
        {/* Plan Label */}
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
          {getPlanLabel()}
        </span>

        {/* Usage Text */}
        <span className={`text-sm font-semibold ${getColor()}`}>
          {getText()}
        </span>

        {/* Progress Bar (solo para planes con límites) */}
        {!hasUnlimitedAccess && (
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full ${getBarColor()} transition-all duration-300`}
              style={{ width: `${Math.max(0, 100 - percentage)}%` }}
            />
          </div>
        )}
      </div>

      {/* Icon de Infinity para planes ilimitados */}
      {hasUnlimitedAccess && (
        <InfinityIcon className={`w-4 h-4 ${isPro ? 'text-violet-400' : 'text-purple-400'}`} />
      )}
    </div>
  );
}