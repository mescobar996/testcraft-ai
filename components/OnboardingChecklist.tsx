"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  getOnboardingState,
  completeStep,
  claimReward,
  shouldShowOnboarding,
  type OnboardingState
} from "@/lib/onboarding";
import {
  Sparkles,
  Image,
  Download,
  Heart,
  CheckCircle2,
  Circle,
  X,
  Gift,
  TrendingUp
} from "lucide-react";

const STEP_ICONS = {
  sparkles: Sparkles,
  image: Image,
  download: Download,
  heart: Heart
};

interface OnboardingChecklistProps {
  onStepComplete?: (stepId: string) => void;
}

export function OnboardingChecklist({ onStepComplete }: OnboardingChecklistProps) {
  const { user, usageCount, isPro, isProTrial, addBonusGenerations } = useAuth();
  const { language } = useLanguage();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const userId = user?.id || null;
    const currentState = getOnboardingState(userId);
    setState(currentState);

    // Verificar si acabamos de completar el onboarding
    if (currentState.isComplete && !currentState.rewardClaimed && !showRewardModal) {
      setShowRewardModal(true);
    }
  }, [user, mounted, showRewardModal]);

  const handleCompleteStep = (stepId: string) => {
    const userId = user?.id || null;
    const newState = completeStep(userId, stepId);
    setState(newState);
    onStepComplete?.(stepId);
  };

  const handleClaimReward = () => {
    const userId = user?.id || null;
    const success = claimReward(userId);

    if (success) {
      // Agregar las +5 generaciones bonus al contador
      addBonusGenerations(5);
      setShowRewardModal(false);

      // Actualizar el estado local para reflejar que se reclamó
      if (state) {
        setState({ ...state, rewardClaimed: true });
      }
    }
  };

  // No renderizar si no está montado (evitar hidratación)
  if (!mounted || !state) {
    return null;
  }

  // No mostrar si el usuario es Pro o está en trial (tienen acceso ilimitado)
  if (isPro || isProTrial) return null;

  // No mostrar si no cumple las condiciones
  if (!shouldShowOnboarding(usageCount, state.isComplete)) return null;

  // No mostrar si fue dismissed
  if (isDismissed) return null;

  return (
    <>
      {/* Checklist Card */}
      <div className="bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-violet-600/10 border border-violet-500/30 rounded-xl p-5 mb-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {language === "es" ? "Primeros Pasos" : "Getting Started"}
                </h3>
                <p className="text-sm text-slate-400">
                  {language === "es"
                    ? "Completa todos los pasos y gana +5 generaciones bonus"
                    : "Complete all steps and earn +5 bonus generations"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label={language === "es" ? "Cerrar" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{language === "es" ? "Progreso" : "Progress"}</span>
              <span className="font-semibold text-violet-400">
                {state.completionPercentage}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                style={{ width: `${state.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {state.steps.map((step) => {
              const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS];
              const isCompleted = step.completed;

              return (
                <button
                  key={step.id}
                  onClick={() => !isCompleted && handleCompleteStep(step.id)}
                  disabled={isCompleted}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                    isCompleted
                      ? "bg-slate-800/30 opacity-60"
                      : "bg-slate-800/50 hover:bg-slate-800/70 cursor-pointer"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500/20"
                          : "bg-violet-500/20"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isCompleted ? "text-green-400" : "text-violet-400"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted ? "text-slate-400 line-through" : "text-white"
                      }`}
                    >
                      {language === "es" ? step.title : step.titleEn}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === "es" ? step.description : step.descriptionEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reward Badge */}
          {state.completionPercentage > 0 && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <Gift className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-300">
                {language === "es"
                  ? `${state.completionPercentage}% completado • ${4 - state.steps.filter(s => s.completed).length} pasos restantes`
                  : `${state.completionPercentage}% complete • ${4 - state.steps.filter(s => s.completed).length} steps remaining`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-8 max-w-md w-full relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-purple-600/10 to-violet-600/10"></div>

            {/* Content */}
            <div className="relative text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Gift className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {language === "es" ? "¡Felicitaciones!" : "Congratulations!"}
              </h3>

              {/* Message */}
              <p className="text-slate-300 mb-6">
                {language === "es"
                  ? "Has completado todos los pasos del onboarding. ¡Has ganado +5 generaciones bonus para usar este mes!"
                  : "You've completed all onboarding steps. You've earned +5 bonus generations to use this month!"}
              </p>

              {/* Reward Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500/20 border border-violet-500/30 rounded-lg mb-6">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span className="text-lg font-bold text-violet-300">
                  +5 {language === "es" ? "Generaciones" : "Generations"}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={handleClaimReward}
                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all"
              >
                {language === "es" ? "Reclamar Recompensa" : "Claim Reward"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook para tracking automático de pasos del onboarding
 * Úsalo en componentes clave para marcar pasos automáticamente
 */
export function useOnboardingTracker() {
  const { user } = useAuth();

  const trackStep = (stepId: string) => {
    const userId = user?.id || null;
    completeStep(userId, stepId);
  };

  return { trackStep };
}
