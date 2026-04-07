"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { QASidebar } from "@/components/QASidebar";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AppIcon } from "@/components/AppIcon";
import { UserMenu } from "@/components/UserMenu";
import { GuidePanel } from "@/components/GuidePanel";
import { CloudHistoryTab } from "@/components/CloudHistoryTab";
import { FavoritesTab } from "@/components/FavoritesTab";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { saveGeneration, HistoryRecord } from "@/lib/history-db";
import { trackGeneration } from "@/lib/analytics";
import { FileText, Shield, Download, CheckCircle2, Heart, Clock, Sparkles } from "lucide-react";

// Lazy load
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

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

export type AIEngine = 'anthropic' | 'ollama' | 'template';
export type NavTab = 'generate' | 'history' | 'favorites';

const ENGINE_LABELS: Record<AIEngine, { name: string; desc: string; dot: string }> = {
  anthropic: { name: "Cloud", desc: "Claude · Pago", dot: "bg-violet-400" },
  ollama: { name: "Local", desc: "Ollama · Gratis", dot: "bg-emerald-400" },
  template: { name: "Template", desc: "Sin IA · <10ms", dot: "bg-amber-400" },
};

const TABS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'generate', label: 'Generar', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'history', label: 'Historial', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'favorites', label: 'Favoritos', icon: <Heart className="w-3.5 h-3.5" /> },
];

export default function Home() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [currentRequirement, setCurrentRequirement] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<AIEngine>('template');
  const [newGeneration, setNewGeneration] = useState<HistoryRecord | null>(null);
  const [triggerGenerate, setTriggerGenerate] = useState(0);
  const [activeTab, setActiveTab] = useState<NavTab>('generate');
  const [qaSidebarOpen, setQaSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleGenerate = async (requirement: string, context: string, format: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentRequirement(requirement);

    try {
      let endpoint: string;
      const body: Record<string, unknown> = { requirement, context, format };

      if (engine === 'ollama') {
        endpoint = '/api/generate-local';
        body.model = 'qwen2.5:7b';
      } else if (engine === 'template') {
        endpoint = '/api/generate-template';
      } else {
        endpoint = '/api/generate';
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || t.errorGeneratingCases);
      }

      const data = await response.json();
      setResult(data);
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

  const handleRegenerateCase = async (testCase: TestCase): Promise<TestCase | null> => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirement: `Regenerar: ${testCase.title}. Tipo: ${testCase.type}. Prioridad: ${testCase.priority}.`,
          context: "Regeneración de caso individual",
          format: "table",
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.testCases?.length > 0) {
        return { ...data.testCases[0], id: testCase.id, type: testCase.type };
      }
      return null;
    } catch { return null; }
  };

  const handleUpdateResult = (updatedResult: GenerationResult) => setResult(updatedResult);

  const handleSelectFromHistory = (requirement: string, historyResult: GenerationResult) => {
    setResult(historyResult);
    setCurrentRequirement(requirement);
    setError(null);
    setActiveTab('generate');
  };

  const handleSelectFavorite = (testCase: TestCase) => {
    setResult({ testCases: [testCase], gherkin: "", summary: "Caso de prueba favorito" });
    setActiveTab('generate');
  };

  const copyGherkin = useCallback(() => {
    if (result?.gherkin) navigator.clipboard.writeText(result.gherkin);
  }, [result]);

  const copyAllCases = useCallback(() => {
    if (result?.testCases) {
      const text = result.testCases.map(tc =>
        `${tc.id} - ${tc.title}\nTipo: ${tc.type} | Prioridad: ${tc.priority}\nPasos:\n${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}\nResultado: ${tc.expectedResult}`
      ).join('\n\n---\n\n');
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

  // Keyboard shortcuts globales
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); triggerGenerateAction(); }
      if (e.ctrlKey && e.key === 'g') { e.preventDefault(); copyGherkin(); }
      if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); copyAllCases(); }
      if (e.ctrlKey && e.key === 'f' && !e.shiftKey) {
        // Only if not in an input/textarea
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          focusRequirement();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [triggerGenerateAction, copyGherkin, copyAllCases, focusRequirement]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: Brand - shrink-0 so it doesn't compress */}
          <div className="flex items-center gap-3 shrink-0">
            <AppIcon size="sm" />
            <span className="text-sm font-semibold tracking-tight hidden md:inline">{t.appName}</span>
          </div>

          {/* Center: Tabs - use mx-auto to center naturally */}
          <nav className="flex items-center gap-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] p-0.5 mx-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right: Guide + User - shrink-0 so they never compress */}
          <div className="flex items-center gap-2 shrink-0">
            <GuidePanel />
            <UserMenu />
          </div>
        </div>

        {/* Mobile tabs - separate row on small screens */}
        <div className="sm:hidden border-t border-white/[0.06] px-4 py-2">
          <nav className="flex items-center gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-zinc-500"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── TAB: GENERATE ── */}
      {activeTab === 'generate' && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-600/8 via-transparent to-transparent" />
            <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-6 sm:pt-16 sm:pb-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                  Generá casos de prueba
                  <span className="text-violet-400"> en segundos</span>
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-xs text-zinc-500 sm:text-sm md:mt-4 md:max-w-xl">
                  Escribí un requisito, elegí un motor y obtené casos profesionales con cobertura completa.
                </p>

                {/* Engine pills */}
                <div className="mt-6 flex items-center justify-center gap-2">
                  {(['template', 'ollama', 'anthropic'] as AIEngine[]).map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => setEngine(eng)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        engine === eng
                          ? eng === 'template'
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                            : eng === 'ollama'
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-violet-500/40 bg-violet-500/10 text-violet-300"
                          : "border-white/10 bg-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/15"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${ENGINE_LABELS[eng].dot}`} />
                      {ENGINE_LABELS[eng].name}
                      <span className="hidden sm:inline text-[10px] opacity-60">· {ENGINE_LABELS[eng].desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Workspace */}
          <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 md:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <TestCaseForm
                onGenerate={handleGenerate}
                isLoading={isLoading}
                triggerGenerate={triggerGenerate}
              />
              <div data-results>
                <TestCaseOutput
                  result={result}
                  isLoading={isLoading}
                  error={error}
                  requirementTitle={currentRequirement.split('\n')[0].substring(0, 50)}
                  onRegenerateCase={handleRegenerateCase}
                  onUpdateResult={handleUpdateResult}
                />
              </div>
            </div>
          </section>

          {/* Features Strip */}
          <section className="border-t border-white/[0.06] bg-zinc-900/40">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard icon={<FileText className="w-5 h-5" />} title="3 motores de IA" desc="Cloud, Local y Templates. Elegí el que mejor se adapte." />
                <FeatureCard icon={<Shield className="w-5 h-5" />} title="Cobertura completa" desc="Positivos, negativos y de borde generados automáticamente." />
                <FeatureCard icon={<Download className="w-5 h-5" />} title="Multi-formato" desc="PDF, Excel, Gherkin, JSON, Jira CSV, TestRail CSV." />
                <FeatureCard icon={<CheckCircle2 className="w-5 h-5" />} title="99 templates" desc="Login, Registro, Carrito, API, Pago y más. Sin IA." />
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── TAB: HISTORY ── */}
      {activeTab === 'history' && (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Historial en la Nube</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {user
                ? "Todas tus generaciones guardadas. Hacé clic en una para reutilizarla."
                : "Iniciá sesión para guardar y ver tu historial."}
            </p>
          </div>
          <CloudHistoryTab
            onSelect={handleSelectFromHistory}
            onNewGeneration={newGeneration}
          />
        </section>
      )}

      {/* ── TAB: FAVORITES ── */}
      {activeTab === 'favorites' && (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Favoritos</h2>
            <p className="text-xs text-zinc-500 mt-1">
              {user
                ? "Casos marcados para acceso rápido. Hacé clic para verlos."
                : "Iniciá sesión para guardar favoritos."}
            </p>
          </div>
          <FavoritesTab onSelectCase={handleSelectFavorite} />
        </section>
      )}

      {/* ── FOOTER ── */}
      <Suspense fallback={<div className="h-32" />}>
        <Footer />
      </Suspense>

      {/* ── QA Sidebar Toggle ── */}
      {result && !isLoading && (
        <button
          onClick={() => setQaSidebarOpen(!qaSidebarOpen)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-violet-600 hover:bg-violet-500 text-white px-2 py-3 rounded-l-lg shadow-lg shadow-violet-600/20 text-xs font-semibold transition-colors"
          aria-label="Abrir herramientas QA"
        >
          🔧
        </button>
      )}

      {/* ── QA Sidebar ── */}
      <QASidebar
        isOpen={qaSidebarOpen}
        onClose={() => setQaSidebarOpen(false)}
        requirement={currentRequirement}
        testCases={result?.testCases || []}
        engine={engine}
        onGenerateWithEngine={(newEngine) => {
          setEngine(newEngine);
          setQaSidebarOpen(false);
          setTriggerGenerate(prev => prev + 1);
        }}
      />
    </main>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/15">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{desc}</p>
      </div>
    </div>
  );
}
