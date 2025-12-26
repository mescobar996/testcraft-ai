"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AppIcon } from "@/components/AppIcon";
import { UserMenu } from "@/components/UserMenu";
import { UsageBanner } from "@/components/UsageBanner";
import { UsageCounter } from "@/components/UsageCounter";
import { KeyboardShortcutsHelp, useKeyboardShortcuts, ShortcutBadge } from "@/components/KeyboardShortcutsImproved";
import { ImageUploader } from "@/components/ImageUploader";
import { TrialBanner, TrialStatusBadge } from "@/components/TrialBanner";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { saveGeneration, HistoryRecord } from "@/lib/history-db";
import { trackGeneration } from "@/lib/analytics";
import { Zap, Shield, Clock, Camera } from "lucide-react";

// Lazy load componentes pesados para mejor performance
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const CloudHistoryPanel = lazy(() => import("@/components/CloudHistoryPanel").then(m => ({ default: m.CloudHistoryPanel })));
const FavoritesPanel = lazy(() => import("@/components/FavoritesPanel").then(m => ({ default: m.FavoritesPanel })));
const DiagnosticPanel = lazy(() => import("@/components/DiagnosticPanel").then(m => ({ default: m.DiagnosticPanel })));
const InteractiveDemo = lazy(() => import("@/components/InteractiveDemo").then(m => ({ default: m.InteractiveDemo })));
const UpgradePrompt = lazy(() => import("@/components/UpgradePrompt").then(m => ({ default: m.UpgradePrompt })));
const OnboardingChecklist = lazy(() => import("@/components/OnboardingChecklist").then(m => ({ default: m.OnboardingChecklist })));

export interface TestCase {
  id: string;
  title: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: "Alta" | "Media" | "Baja";
  type: "Positivo" | "Negativo" | "Borde";
}

export interface GenerationResult {
  testCases: TestCase[];
  gherkin: string;
  summary: string;
}

export default function Home() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [currentRequirement, setCurrentRequirement] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGeneration, setNewGeneration] = useState<HistoryRecord | null>(null);
  const [triggerGenerate, setTriggerGenerate] = useState(0);
  const { user, canGenerate, incrementUsage, isPro, usageCount, maxUsage } = useAuth();
  const { t } = useLanguage();

  const handleGenerate = async (requirement: string, context: string, format: string) => {
    if (!canGenerate) {
      setError(t.limitReached);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentRequirement(requirement);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement, context, format }),
      });

      if (!response.ok) throw new Error(t.errorGeneratingCases);

      const data = await response.json();
      setResult(data);
      incrementUsage();

      // Track analytics
      trackGeneration(user?.id || null, false);

      if (user) {
        const saved = await saveGeneration(user.id, requirement, context, data);
        if (saved) setNewGeneration(saved);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromImage = (imageResult: GenerationResult) => {
    setResult(imageResult);
    setCurrentRequirement(t.generatedFromImage);
    setError(null);
    incrementUsage();

    // Track analytics para generación desde imagen
    trackGeneration(user?.id || null, true);
  };

  const handleRegenerateCase = async (testCase: TestCase): Promise<TestCase | null> => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement: `Regenerar el siguiente caso de prueba con mejoras:
Título: ${testCase.title}
Tipo: ${testCase.type}
Prioridad: ${testCase.priority}
Precondiciones: ${testCase.preconditions}
Pasos actuales: ${testCase.steps.join(", ")}
Resultado esperado: ${testCase.expectedResult}

Genera una versión mejorada manteniendo el mismo ID y tipo.`,
          context: "Regeneración de caso individual",
          format: "table",
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.testCases && data.testCases.length > 0) {
        return { ...data.testCases[0], id: testCase.id, type: testCase.type };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleUpdateResult = (updatedResult: GenerationResult) => {
    setResult(updatedResult);
  };

  const handleSelectFromHistory = (requirement: string, historyResult: GenerationResult) => {
    setResult(historyResult);
    setCurrentRequirement(requirement);
    setError(null);
  };

  const handleSelectFavorite = (testCase: TestCase) => {
    setResult({
      testCases: [testCase],
      gherkin: "",
      summary: "Caso de prueba favorito"
    });
  };

  const copyGherkin = useCallback(() => {
    if (result?.gherkin) navigator.clipboard.writeText(result.gherkin);
  }, [result]);

  const copyAllCases = useCallback(() => {
    if (result?.testCases) {
      const text = result.testCases.map(tc => 
        `${tc.id} - ${tc.title}\nTipo: ${tc.type} | Prioridad: ${tc.priority}\nPasos:\n${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\nResultado: ${tc.expectedResult}`
      ).join("\n\n---\n\n");
      navigator.clipboard.writeText(text);
    }
  }, [result]);

  const focusRequirement = useCallback(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  }, []);

  const triggerGenerateAction = useCallback(() => {
    setTriggerGenerate(prev => prev + 1);
  }, []);

  const shortcuts = [
    { key: "Enter", ctrl: true, description: "Generar casos de prueba", action: triggerGenerateAction },
    { key: "g", ctrl: true, description: "Copiar Gherkin", action: copyGherkin },
    { key: "c", ctrl: true, shift: true, description: "Copiar todos los casos", action: copyAllCases },
    { key: "f", ctrl: true, description: "Enfocar campo de requisito", action: focusRequirement },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <main className="min-h-screen relative">
      <header className="border-b border-violet-500/20 bg-purple-950/60 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-violet-500/10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="transition-transform duration-200 group-hover:scale-105">
                <AppIcon size="lg" withGlow />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">{t.appName}</h1>
                <p className="text-[10px] sm:text-xs text-zinc-500">{t.appSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <UsageCounter />
              <div className="hidden md:flex items-center gap-2">
                <KeyboardShortcutsHelp shortcuts={shortcuts} />
                <Suspense fallback={<div className="w-8 h-8" />}>
                  <FavoritesPanel onSelectCase={handleSelectFavorite} />
                </Suspense>
                <Suspense fallback={<div className="w-8 h-8" />}>
                  <CloudHistoryPanel
                    onSelect={handleSelectFromHistory}
                    onNewGeneration={newGeneration}
                  />
                </Suspense>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Hero Section - Mobile First */}
        <div className="max-w-6xl mx-auto mb-10 sm:mb-14 md:mb-20">
          <div className="mb-6 sm:mb-8 md:mb-12 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
              {t.heroTitle}{" "}
              <span className="text-violet-500">
                {t.heroHighlight}
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-7 md:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
              {t.heroSubtitle}
            </p>

            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-7 md:mb-8 px-4">
              <ImageUploader
                onGenerateFromImage={handleGenerateFromImage}
                isLoading={isImageLoading}
                setIsLoading={setIsImageLoading}
              />
            </div>
          </div>

          <TrialBanner />
          <UsageBanner />
          <Suspense fallback={<div className="h-20" />}>
            <OnboardingChecklist />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <TestCaseForm
                onGenerate={handleGenerate}
                isLoading={isLoading}
                triggerGenerate={triggerGenerate}
              />
            </div>

            <div className="order-1 lg:order-2" data-results>
              <TestCaseOutput
                result={result}
                isLoading={isLoading || isImageLoading}
                error={error}
                requirementTitle={currentRequirement.split('\n')[0].substring(0, 50)}
                onRegenerateCase={handleRegenerateCase}
                onUpdateResult={handleUpdateResult}
              />
            </div>
          </div>
        </div>

        {/* 01. Sobre TestCraft AI - Mobile First */}
        <section className="w-full max-w-6xl mx-auto mb-12 md:mb-16 lg:mb-24 px-4">
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">{t.aboutTitle}</h2>
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto px-2">
              {t.aboutDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-4 sm:p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-violet-400/50 transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-violet-400 mb-1 md:mb-2">10K+</div>
              <div className="text-gray-300 text-xs sm:text-sm">{t.statsGenerated}</div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-violet-400/50 transition-all">
              <div className="text-3xl sm:text-4xl font-bold text-violet-400 mb-1 md:mb-2">500+</div>
              <div className="text-gray-300 text-xs sm:text-sm">{t.statsUsers}</div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-violet-400/50 transition-all sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl font-bold text-violet-400 mb-1 md:mb-2">24/7</div>
              <div className="text-gray-300 text-xs sm:text-sm">{t.statsAvailability}</div>
            </div>
          </div>
        </section>

        {/* 02. Características & Tecnologías - Mobile First */}
        <section className="w-full max-w-6xl mx-auto mb-12 md:mb-16 lg:mb-24 px-4">
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">{t.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">{t.featuresAI}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <SkillTag>{t.tagClaudeAI}</SkillTag>
                <SkillTag>{t.tagPositive}</SkillTag>
                <SkillTag>{t.tagNegative}</SkillTag>
                <SkillTag>{t.tagEdge}</SkillTag>
                <SkillTag icon={<Camera className="w-3 h-3" />}>{t.tagFromImage}</SkillTag>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">{t.featuresFormats}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <SkillTag>{t.tagGherkin}</SkillTag>
                <SkillTag>{t.tagTable}</SkillTag>
                <SkillTag>{t.tagJSON}</SkillTag>
                <SkillTag>{t.tagPDF}</SkillTag>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">{t.featuresIntegrationsSoon}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <SkillTag>{t.tagJira}</SkillTag>
                <SkillTag>{t.tagAzure}</SkillTag>
                <SkillTag>{t.tagGitHub}</SkillTag>
                <SkillTag>{t.tagTestRail}</SkillTag>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 md:mb-4 text-xs sm:text-sm uppercase tracking-wider">{t.featuresPerformance}</h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <SkillTag icon={<Zap className="w-3 h-3" />}>{t.tagFast}</SkillTag>
                <SkillTag>{t.tagCloud}</SkillTag>
                <SkillTag>{t.tagHistory}</SkillTag>
              </div>
            </div>
          </div>
        </section>

        {/* 03. Casos de Uso - Mobile First */}
        <section className="w-full max-w-6xl mx-auto mb-12 md:mb-16 lg:mb-24 px-4">
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">{t.useCasesTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <ProjectCard
              title={t.useCaseEcommerce}
              description={t.useCaseEcommerceDesc}
              tags={["Stripe", "PayPal", "Carrito"]}
            />
            <ProjectCard
              title={t.useCaseAPI}
              description={t.useCaseAPIDesc}
              tags={["OAuth", "JWT", "CRUD"]}
            />
            <ProjectCard
              title={t.useCaseUI}
              description={t.useCaseUIDesc}
              tags={["Responsive", "Forms", "Navigation"]}
              isNew
            />
            <ProjectCard
              title={t.useCaseRegression}
              description={t.useCaseRegressionDesc}
              tags={["CI/CD", "Automation", "Regression"]}
            />
          </div>
        </section>

        {/* 04. Demo Interactivo - Mobile First */}
        <section className="w-full max-w-5xl mx-auto mb-12 md:mb-16 lg:mb-24 px-4">
          <div className="text-center mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
              {t.demoTitle}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              {t.demoSubtitle}
            </p>
          </div>
          <Suspense fallback={<div className="h-96 bg-slate-900/30 rounded-xl animate-pulse" />}>
            <InteractiveDemo />
          </Suspense>
        </section>
      </div>

      <Suspense fallback={<div className="h-32" />}>
        <Footer />
      </Suspense>

      {/* Upgrade prompt contextual */}
      {user && !isPro && (
        <Suspense fallback={null}>
          <UpgradePrompt usageCount={usageCount} maxUsage={maxUsage} />
        </Suspense>
      )}

      {/* Panel de diagnóstico - TEMPORAL para debugging */}
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <DiagnosticPanel />
        </Suspense>
      )}
    </main>
  );
}

function SkillTag({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded text-gray-300 text-[10px] sm:text-xs font-medium hover:border-violet-400/50 transition-colors">
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </div>
  );
}

function ProjectCard({ title, description, tags, isNew }: { title: string; description: string; tags: string[]; isNew?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 sm:p-5 md:p-6 hover:border-white/20 transition-colors relative">
      {isNew && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-violet-500 rounded text-[9px] sm:text-[10px] font-bold text-white uppercase">
          {t.new}
        </div>
      )}
      <h3 className="text-white font-semibold mb-2 sm:mb-3 text-base sm:text-lg">{title}</h3>
      <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 sm:py-1 bg-white/10 text-gray-400 text-[10px] sm:text-xs rounded whitespace-nowrap">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
