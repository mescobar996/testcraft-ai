"use client";

import { useState } from "react";
import { TestCaseForm } from "@/components/TestCaseForm";
import { TestCaseOutput } from "@/components/TestCaseOutput";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AppIcon, AppIconSVG } from "@/components/AppIcon";
import { UserMenu } from "@/components/UserMenu";
import { UsageBanner } from "@/components/UsageBanner";
import { CloudHistoryPanel } from "@/components/CloudHistoryPanel";
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

      // Increment usage counter
      incrementUsage();

      // Save to cloud if user is logged in
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
            
            {/* Right side: History + User Menu */}
            <div className="flex items-center gap-3">
              {/* Cloud History */}
              <CloudHistoryPanel 
                onSelect={handleSelectFromHistory}
                onNewGeneration={newGeneration}
              />
              
              {/* User Menu */}
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

          {/* Usage Banner */}
          <UsageBanner />

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
