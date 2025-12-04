"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Zap, Infinity, Crown } from "lucide-react";

export function UsageCounter() {
  const { user, usageCount, dailyLimit, isPro } = useAuth();
  const { language } = useLanguage();

  const remaining = dailyLimit - usageCount;
  const percentage = (usageCount / dailyLimit) * 100;

  const getText = () => {
    if (isPro) {
      return language === "es" ? "Ilimitado" : "Unlimited";
    }
    if (!user) {
      return language === "es" 
        ? `${remaining} de ${dailyLimit} gratis` 
        : `${remaining} of ${dailyLimit} free`;
    }
    return language === "es"
      ? `${remaining} de ${dailyLimit} restantes`
      : `${remaining} of ${dailyLimit} remaining`;
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

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
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
              style={{ width: `${100 - percentage}%` }}
            />
          </div>
        )}
      </div>

      {isPro && (
        <Infinity className="w-4 h-4 text-violet-400" />
      )}
    </div>
  );
}
