"use client";

import { useState, useCallback } from "react";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AppIcon } from "@/components/AppIcon";
import { UserMenu } from "@/components/UserMenu";
import { UsageBanner } from "@/components/UsageBanner";
import { CloudHistoryPanel } from "@/components/CloudHistoryPanel";
import { FavoritesPanel } from "@/components/FavoritesPanel";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { useAuth } from "@/lib/auth-context";
import { saveGeneration, HistoryRecord } from "@/lib/history-db";
import { Zap, Shield, Clock } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [newGeneration, setNewGeneration] = useState<HistoryRecord | null>(null);
  const [triggerGenerate, setTriggerGenerate] = useState(0);
  const { user, canGenerate, incrementUsage } = useAuth();

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requirement, context, format }),
      });

      if (!response.ok) {
        throw new Error("Error al generar casos de prueba");
      }

      const data = await response.json();
      setResult(data);

      incrementUsage();

      if (user) {
        const saved = await saveGeneration(user.id, requirement, context, data);
        if (saved) {
          setNewGeneration(saved);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
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

  // Funciones para atajos de teclado
  const copyGherkin = useCallback(() => {
    if (result?.gherkin) {
      navigator.clipboard.writeText(result.gherkin);
    }
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
    if (textarea) {
      textarea.focus();
    }
  }, []);

  const triggerGenerateAction = useCallback(() => {
    setTriggerGenerate(prev => prev + 1);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToResults = useCallback(() => {
    const resultsSection = document.querySelector('[data-results]');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Definir atajos
  const shortcuts = [
    { key: "Enter", ctrl: true, description: "Generar casos de prueba", action: triggerGenerateAction },
    { key: "g", ctrl: true, description: "Copiar Gherkin", action: copyGherkin },
    { key: "c", ctrl: true, shift: true, description: "Copiar todos los casos", action: copyAllCases },
    { key: "f", ctrl: true, description: "Enfocar campo de requisito", action: focusRequirement },
    { key: "ArrowUp", ctrl: true, description: "Ir al inicio", action: scrollToTop },
    { key: "ArrowDown", ctrl: true, description: "Ir a resultados", action: scrollToResults },
  ];

  // Activar atajos
  useKeyboardShortcuts(shortcuts);

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppIcon size="lg" withGlow />
              <div>
                <h1 className="text-xl font-bold text-white">TestCraft AI</h1>
                <p className="text-xs text-slate-400">Generador de Casos de Prueba</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Generá casos de prueba{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
                en segundos
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Pegá tus requisitos o historias de usuario y obtené casos de prueba 
              profesionales con cobertura completa, incluyendo casos de borde y negativos.
            </p>
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
                isLoading={isLoading} 
                error={error}
                requirementTitle={currentRequirement.split('\n')[0].substring(0, 50)}
              />
            </div>
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="Generación Instantánea"
              description="Casos de prueba completos en segundos, no en horas."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-400" />}
              title="Cobertura Exhaustiva"
              description="Casos positivos, negativos y de borde automáticamente."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-blue-400" />}
              title="Múltiples Formatos"
              description="Exportá a Excel, PDF, Gherkin o copiá directo a tu herramienta."
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AppIcon size="sm" />
              <span className="text-slate-400 font-medium">TestCraft AI</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 TestCraft AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-violet-500/30 transition-all duration-300 group">
      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
