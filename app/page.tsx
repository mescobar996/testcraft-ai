"use client";

import { useState, useEffect } from "react";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { HistoryPanel, HistoryItem } from "@/components/HistoryPanel";
import { AppIcon, AppIconSVG } from "@/components/AppIcon";
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

const HISTORY_KEY = "testcraft-history";

export default function Home() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((item: HistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error("Error loading history:", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleGenerate = async (requirement: string, context: string, format: string) => {
    setIsLoading(true);
    setError(null);

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

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date(),
        requirement,
        result: data,
      };
      saveHistory([newItem, ...history].slice(0, 20)); // Keep last 20 items

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item.result);
    setError(null);
  };

  const handleDeleteHistory = (id: string) => {
    saveHistory(history.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* History Panel */}
      <HistoryPanel
        history={history}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
      />

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
            
            {/* Feature badges */}
            <div className="hidden md:flex items-center gap-4">
              <FeatureBadge icon={<Zap className="w-3.5 h-3.5" />} text="IA Avanzada" />
              <FeatureBadge icon={<Shield className="w-3.5 h-3.5" />} text="Cobertura Completa" />
              <FeatureBadge icon={<Clock className="w-3.5 h-3.5" />} text="En Segundos" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-4">
              <AppIconSVG className="w-4 h-4" />
              <span>Potenciado por IA</span>
            </div>
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

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="order-2 lg:order-1">
              <TestCaseForm onGenerate={handleGenerate} isLoading={isLoading} />
            </div>

            {/* Output Column */}
            <div className="order-1 lg:order-2">
              <TestCaseOutput 
                result={result} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>
          </div>
          
          {/* Features Section */}
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
              description="Exportá a Excel, Gherkin o copiá directo a tu herramienta."
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

function FeatureBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="text-violet-400">{icon}</span>
      {text}
    </div>
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
