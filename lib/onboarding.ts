/**
 * Sistema de Onboarding Checklist
 * Mejora la activación de nuevos usuarios guiándolos a través de features clave
 */

const ONBOARDING_KEY = 'testcraft-onboarding';
const ONBOARDING_REWARD_KEY = 'testcraft-onboarding-reward';

export interface OnboardingStep {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  completed: boolean;
  icon: string;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  completionPercentage: number;
  isComplete: boolean;
  rewardClaimed: boolean;
}

const DEFAULT_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 'first_generation',
    title: 'Genera tu primer caso de prueba',
    titleEn: 'Generate your first test case',
    description: 'Describe tu funcionalidad y genera casos de prueba automáticamente',
    descriptionEn: 'Describe your feature and generate test cases automatically',
    icon: 'sparkles'
  },
  {
    id: 'try_image_upload',
    title: 'Prueba la generación desde imagen',
    titleEn: 'Try image-based generation',
    description: 'Sube una captura de pantalla y genera tests desde la UI',
    descriptionEn: 'Upload a screenshot and generate tests from UI',
    icon: 'image'
  },
  {
    id: 'export_tests',
    title: 'Exporta tus casos de prueba',
    titleEn: 'Export your test cases',
    description: 'Descarga en Excel, PDF o Gherkin para usar en tu proyecto',
    descriptionEn: 'Download as Excel, PDF or Gherkin to use in your project',
    icon: 'download'
  },
  {
    id: 'save_favorite',
    title: 'Guarda en favoritos',
    titleEn: 'Save to favorites',
    description: 'Marca tus mejores tests para acceso rápido',
    descriptionEn: 'Mark your best tests for quick access',
    icon: 'heart'
  }
];

/**
 * Obtiene el estado actual del onboarding para un usuario
 */
export function getOnboardingState(userId: string | null): OnboardingState {
  if (typeof window === 'undefined') {
    return {
      steps: DEFAULT_STEPS.map(step => ({ ...step, completed: false })),
      completionPercentage: 0,
      isComplete: false,
      rewardClaimed: false
    };
  }

  const key = userId ? `${ONBOARDING_KEY}-${userId}` : ONBOARDING_KEY;
  const rewardKey = userId ? `${ONBOARDING_REWARD_KEY}-${userId}` : ONBOARDING_REWARD_KEY;

  const savedState = localStorage.getItem(key);
  const rewardClaimed = localStorage.getItem(rewardKey) === 'true';

  if (!savedState) {
    return {
      steps: DEFAULT_STEPS.map(step => ({ ...step, completed: false })),
      completionPercentage: 0,
      isComplete: false,
      rewardClaimed
    };
  }

  try {
    const steps: OnboardingStep[] = JSON.parse(savedState);
    const completedCount = steps.filter(s => s.completed).length;
    const completionPercentage = Math.round((completedCount / steps.length) * 100);
    const isComplete = completionPercentage === 100;

    return {
      steps,
      completionPercentage,
      isComplete,
      rewardClaimed
    };
  } catch {
    return {
      steps: DEFAULT_STEPS.map(step => ({ ...step, completed: false })),
      completionPercentage: 0,
      isComplete: false,
      rewardClaimed
    };
  }
}

/**
 * Marca un paso como completado
 */
export function completeStep(userId: string | null, stepId: string): OnboardingState {
  if (typeof window === 'undefined') {
    return getOnboardingState(userId);
  }

  const state = getOnboardingState(userId);
  const updatedSteps = state.steps.map(step =>
    step.id === stepId ? { ...step, completed: true } : step
  );

  const key = userId ? `${ONBOARDING_KEY}-${userId}` : ONBOARDING_KEY;
  localStorage.setItem(key, JSON.stringify(updatedSteps));

  const completedCount = updatedSteps.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedCount / updatedSteps.length) * 100);
  const isComplete = completionPercentage === 100;

  return {
    steps: updatedSteps,
    completionPercentage,
    isComplete,
    rewardClaimed: state.rewardClaimed
  };
}

/**
 * Reclama la recompensa de completar el onboarding
 */
export function claimReward(userId: string | null): boolean {
  if (typeof window === 'undefined') return false;

  const state = getOnboardingState(userId);
  if (!state.isComplete || state.rewardClaimed) {
    return false;
  }

  const rewardKey = userId ? `${ONBOARDING_REWARD_KEY}-${userId}` : ONBOARDING_REWARD_KEY;
  localStorage.setItem(rewardKey, 'true');

  return true;
}

/**
 * Reinicia el onboarding (solo para desarrollo/testing)
 */
export function resetOnboarding(userId: string | null): void {
  if (typeof window === 'undefined') return;

  const key = userId ? `${ONBOARDING_KEY}-${userId}` : ONBOARDING_KEY;
  const rewardKey = userId ? `${ONBOARDING_REWARD_KEY}-${userId}` : ONBOARDING_REWARD_KEY;

  localStorage.removeItem(key);
  localStorage.removeItem(rewardKey);
}

/**
 * Verifica si el usuario debería ver el checklist
 * Solo mostrarlo a usuarios nuevos (menos de 5 generaciones)
 */
export function shouldShowOnboarding(usageCount: number, isComplete: boolean): boolean {
  if (isComplete) return false;
  return usageCount < 5;
}
