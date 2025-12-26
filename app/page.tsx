"use client";

import { useState, useCallback } from "react";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AppIcon } from "@/components/AppIcon";
import { Footer } from "@/components/Footer";
import { UserMenu } from "@/components/UserMenu";
import { UsageBanner } from "@/components/UsageBanner";
import { UsageCounter } from "@/components/UsageCounter";
import { CloudHistoryPanel } from "@/components/CloudHistoryPanel";
import { FavoritesPanel } from "@/components/FavoritesPanel";
import { KeyboardShortcutsHelp, useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
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
      <header className="border-b border-zinc-800/50 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="transition-transform duration-200 group-hover:scale-105">
                <AppIcon size="lg" withGlow />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t.appName}</h1>
                <p className="text-xs text-zinc-500">{t.appSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <UsageCounter />
              <LanguageToggle />
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

      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto mb-32">
          <div className="mb-16">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              {t.heroTitle}{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {t.heroHighlight}
              </span>
            </h1>
            <p className="text-zinc-400 text-xl md:text-2xl mb-10 leading-relaxed max-w-3xl">{t.heroSubtitle}</p>

            <div className="flex gap-4 mb-8">
              <ImageUploader
                onGenerateFromImage={handleGenerateFromImage}
                isLoading={isImageLoading}
                setIsLoading={setIsImageLoading}
              />
            </div>
          </div>

          <UsageBanner />

          <div className="grid lg:grid-cols-2 gap-8">
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

        {/* 01. Sobre TestCraft AI */}
        <section className="max-w-5xl mx-auto mb-40">
          <div className="flex items-baseline gap-6 mb-10">
            <span className="text-7xl font-bold text-zinc-900/50 dark:text-zinc-800">01</span>
            <h2 className="text-4xl font-bold text-white">Sobre TestCraft AI</h2>
          </div>
          <div className="pl-24">
            <p className="text-zinc-400 text-lg md:text-xl mb-12 leading-relaxed max-w-3xl">
              TestCraft AI es la herramienta definitiva para QA Engineers y desarrolladores que buscan automatizar la creación de casos de prueba profesionales. Utilizamos inteligencia artificial avanzada para generar casos completos, incluyendo escenarios positivos, negativos y de borde.
            </p>
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">10K+</div>
                <div className="text-zinc-500 text-sm uppercase tracking-wider">Casos Generados</div>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">500+</div>
                <div className="text-zinc-500 text-sm uppercase tracking-wider">Usuarios Activos</div>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">24/7</div>
                <div className="text-zinc-500 text-sm uppercase tracking-wider">Disponibilidad</div>
              </div>
            </div>
          </div>
        </section>

        {/* 02. Características & Tecnologías */}
        <section className="max-w-5xl mx-auto mb-40">
          <div className="flex items-baseline gap-6 mb-10">
            <span className="text-7xl font-bold text-zinc-900/50 dark:text-zinc-800">02</span>
            <h2 className="text-4xl font-bold text-white">Características & Tecnologías</h2>
          </div>
          <div className="pl-24 grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Generación IA</h3>
              <div className="flex flex-wrap gap-2">
                <SkillTag>Claude AI</SkillTag>
                <SkillTag>Casos Positivos</SkillTag>
                <SkillTag>Casos Negativos</SkillTag>
                <SkillTag>Casos Borde</SkillTag>
                <SkillTag icon={<Camera className="w-3 h-3" />}>Desde Imagen</SkillTag>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Formatos</h3>
              <div className="flex flex-wrap gap-2">
                <SkillTag>Gherkin</SkillTag>
                <SkillTag>Tabla</SkillTag>
                <SkillTag>JSON</SkillTag>
                <SkillTag>PDF Export</SkillTag>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Integraciones</h3>
              <div className="flex flex-wrap gap-2">
                <SkillTag>Jira</SkillTag>
                <SkillTag>Azure DevOps</SkillTag>
                <SkillTag>GitHub</SkillTag>
                <SkillTag>TestRail</SkillTag>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Performance</h3>
              <div className="flex flex-wrap gap-2">
                <SkillTag icon={<Zap className="w-3 h-3" />}>Generación Rápida</SkillTag>
                <SkillTag>Cloud Storage</SkillTag>
                <SkillTag>Historial</SkillTag>
              </div>
            </div>
          </div>
        </section>

        {/* 03. Casos de Uso */}
        <section className="max-w-5xl mx-auto mb-40">
          <div className="flex items-baseline gap-6 mb-10">
            <span className="text-7xl font-bold text-zinc-900/50 dark:text-zinc-800">03</span>
            <h2 className="text-4xl font-bold text-white">Casos de Uso Destacados</h2>
          </div>
          <div className="pl-24 grid md:grid-cols-2 gap-8">
            <ProjectCard
              title="Testing E-Commerce"
              description="Genera casos completos para flujos de compra, carritos, checkout y pagos."
              tags={["Stripe", "PayPal", "Carrito"]}
            />
            <ProjectCard
              title="APIs REST"
              description="Casos de prueba para endpoints, autenticación, validaciones y errores."
              tags={["OAuth", "JWT", "CRUD"]}
            />
            <ProjectCard
              title="Testing UI/UX"
              description="Desde screenshots, genera casos para formularios, navegación y responsive."
              tags={["Responsive", "Forms", "Navigation"]}
              isNew
            />
            <ProjectCard
              title="Regresión Automática"
              description="Mantén tu suite de casos actualizada con cada nueva feature."
              tags={["CI/CD", "Automation", "Regression"]}
            />
          </div>
        </section>

        {/* 04. Comienza Ahora */}
        <section className="max-w-5xl mx-auto mb-40">
          <div className="flex items-baseline gap-6 mb-10">
            <span className="text-7xl font-bold text-zinc-900/50 dark:text-zinc-800">04</span>
            <h2 className="text-4xl font-bold text-white">Comienza Ahora</h2>
          </div>
          <div className="pl-24">
            <p className="text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed max-w-3xl">
              Empieza a generar casos de prueba profesionales en segundos. Gratis para siempre con 20 generaciones diarias.
            </p>
            <div className="flex gap-4">
              <a href="#" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-violet-500/25">
                Comenzar Gratis
              </a>
              <a href="/pricing" className="px-8 py-4 border border-zinc-800 hover:border-zinc-700 text-white font-semibold rounded-lg transition-all duration-200">
                Ver Planes
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function SkillTag({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900/30 border border-zinc-800/50 rounded-lg text-zinc-400 text-sm font-medium hover:border-violet-500/30 hover:bg-zinc-900/50 transition-all duration-200">
      {icon}
      {children}
    </div>
  );
}

function ProjectCard({ title, description, tags, isNew }: { title: string; description: string; tags: string[]; isNew?: boolean }) {
  return (
    <div className="bg-zinc-950/30 border border-zinc-800/50 rounded-xl p-8 hover:border-violet-500/30 hover:bg-zinc-950/50 transition-all duration-200 relative group">
      {isNew && (
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg text-xs font-semibold text-white shadow-lg">
          NUEVO
        </div>
      )}
      <h3 className="text-white font-bold mb-4 text-xl group-hover:text-violet-400 transition-colors">{title}</h3>
      <p className="text-zinc-400 text-base mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 text-xs rounded-md font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
