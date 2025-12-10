"use client";

import { useState, useCallback } from "react";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AppIcon } from "@/components/AppIcon";
import { UserMenu } from "@/components/UserMenu";
import { UsageBanner } from "@/components/UsageBanner";
import { UsageCounter } from "@/components/UsageCounter";
import { CloudHistoryPanel } from "@/components/CloudHistoryPanel";
import { FavoritesPanel } from "@/components/FavoritesPanel";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ImageUploader } from "@/components/ImageUploader";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { saveGeneration, HistoryRecord } from "@/lib/history-db";
import { Zap, Shield, Clock, Camera } from "lucide-react";

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
  const { user, canGenerate, incrementUsage } = useAuth();
  const { t } = useLanguage();

  const handleGenerate = async (requirement: string, context: string, format: string) => {
    if (!canGenerate) {
      setError("Has alcanzado el límite diario de generaciones. Iniciá sesión o actualizá a Pro para obtener más.");
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

      if (!response.ok) throw new Error("Error al generar casos de prueba");

      const data = await response.json();
      setResult(data);
      incrementUsage();

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
    setCurrentRequirement("Generado desde imagen");
    setError(null);
    incrementUsage();
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
      <AnimatedBackground />

      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppIcon size="lg" withGlow />
              <div>
                <h1 className="text-xl font-bold text-white">{t.appName}</h1>
                <p className="text-xs text-slate-400">{t.appSubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <UsageCounter />
              <LanguageToggle />
              <ThemeToggle />
              <KeyboardShortcutsHelp shortcuts={shortcuts} />
              <FavoritesPanel onSelectCase={handleSelectFavorite} />
              <CloudHistoryPanel 
                onSelect={handleSelectFromHistory}
                onNewGeneration={newGeneration}
              />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t.heroTitle}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                {t.heroHighlight}
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t.heroSubtitle}</p>
            
            {/* Image Upload Button - Destacado */}
            <div className="mt-6">
              <ImageUploader 
                onGenerateFromImage={handleGenerateFromImage}
                isLoading={isImageLoading}
                setIsLoading={setIsImageLoading}
              />
            </div>
          </div>

          <UsageBanner />

          <div className="grid lg:grid-cols-2 gap-6">
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
          
          <div className="mt-16 grid md:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Camera className="w-6 h-6 text-fuchsia-400" />}
              title="Desde Imagen"
              description="Subí un screenshot y generamos casos automáticamente."
              isNew
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title={t.feature1Title}
              description={t.feature1Desc}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-400" />}
              title={t.feature2Title}
              description={t.feature2Desc}
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-blue-400" />}
              title={t.feature3Title}
              description={t.feature3Desc}
            />
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AppIcon size="sm" />
              <span className="text-slate-400 font-medium">{t.appName}</span>
            </div>
            <p className="text-slate-500 text-sm">{t.copyright}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, isNew }: { icon: React.ReactNode; title: string; description: string; isNew?: boolean }) {
  return (
    <div className={`bg-slate-900/50 border rounded-xl p-6 hover:border-violet-500/30 transition-all duration-300 group relative ${isNew ? 'border-fuchsia-500/50' : 'border-slate-800'}`}>
      {isNew && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full text-xs font-bold text-white">
          NUEVO
        </div>
      )}
      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
