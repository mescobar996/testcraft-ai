"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Zap, Infinity as InfinityIcon, Crown } from "lucide-react";

export function UsageCounter() {
  const { user, usageCount, isPro } = useAuth();
  const { language } = useLanguage();
  
  // --- CORRECCIÓN DE HIDRATACIÓN ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // ---------------------------------

  // Límites según el estado del usuario
  const dailyLimit = !user ? 5 : isPro ? 999 : 20;
  const remaining = isPro ? 999 : dailyLimit - usageCount;
  const percentage = isPro ? 0 : (usageCount / dailyLimit) * 100;

  const getText = () => {
    if (isPro) {
      return language === "es" ? "Ilimitado" : "Unlimited";
    }
    if (!user) {
      return language === "es" 
        ? `${remaining} de 5 gratis` 
        : `${remaining} of 5 free`;
    }
    return language === "es"
      ? `${remaining} de 20 restantes`
      : `${remaining} of 20 remaining`;
  };

  const getColor = () => {
    if (isPro) return "text-violet-400";
    if (remaining <= 1) return "text-red-400";
    if (remaining <= 3) return "text-yellow-400";
    return "text-slate-400";
  };

  const getBarColor = () => {
    if (isPro) return "bg-violet-500";
    if (remaining <= 1) return "bg-red-500";
    if (remaining <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Si no ha montado, retornamos un esqueleto rectangular para que no "salte" el diseño
  if (!mounted) {
    return (
        <div className="h-8 w-32 bg-slate-800/50 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg animate-in fade-in duration-300">
      {isPro ? (
        <Crown className="w-4 h-4 text-violet-400" />
      ) : (
        <Zap className={`w-4 h-4 ${getColor()}`} />
      )}
      
      <div className="flex flex-col min-w-[80px]">
        <span className={`text-xs font-medium ${getColor()}`}>
          {getText()}
        </span>
        
        {!isPro && (
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full ${getBarColor()} transition-all duration-300`}
              style={{ width: `${Math.max(0, 100 - percentage)}%` }}
            />
          </div>
        )}
      </div>

      {isPro && (
        <InfinityIcon className="w-4 h-4 text-violet-400" />
      )}
    </div>
  );
}