"use client";

import { useState } from "react";
import { X, CheckCircle, Clock, Lightbulb, GitCompare } from "lucide-react";
import { RequirementValidator } from "./RequirementValidator";
import { ExecutionEstimate } from "./ExecutionEstimate";
import { QualitySuggestions } from "./QualitySuggestions";
import { CompareMode } from "./CompareMode";
import { TestCase, AIEngine, GenerationResult } from "@/app/page";

interface QASidebarProps {
  isOpen: boolean;
  onClose: () => void;
  requirement?: string;
  testCases?: TestCase[];
  engine?: AIEngine;
  onGenerateWithEngine?: (engine: AIEngine) => void;
}

export function QASidebar({
  isOpen,
  onClose,
  requirement = "",
  testCases = [],
  engine = "template",
  onGenerateWithEngine,
}: QASidebarProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCompare = async (
    req1: string,
    req2: string,
    context: string,
  ): Promise<{ version1: GenerationResult; version2: GenerationResult }> => {
    if (onGenerateWithEngine) {
      onGenerateWithEngine(engine);
    }

    const emptyResult: GenerationResult = {
      testCases: [],
      gherkin: "",
      summary: "",
    };

    return { version1: emptyResult, version2: emptyResult };
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        data-testid="sidebar-backdrop"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-white/[0.06] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-lg">&#x1F527;</span>
            Herramientas QA
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tools list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* 1. Validador */}
          <ToolCard
            icon={<CheckCircle className="w-4 h-4 text-green-400" />}
            title="Validador de Requisitos"
            active={activeTool === "validator"}
            onClick={() =>
              setActiveTool(activeTool === "validator" ? null : "validator")
            }
          >
            <RequirementValidator
              requirement={requirement}
              show={activeTool === "validator"}
            />
          </ToolCard>

          {/* 2. Estimaci&#243;n */}
          <ToolCard
            icon={<Clock className="w-4 h-4 text-blue-400" />}
            title="Estimaci&#243;n de Tiempo"
            active={activeTool === "estimate"}
            onClick={() =>
              setActiveTool(activeTool === "estimate" ? null : "estimate")
            }
          >
            <ExecutionEstimate testCases={testCases} />
          </ToolCard>

          {/* 3. Sugerencias */}
          <ToolCard
            icon={<Lightbulb className="w-4 h-4 text-yellow-400" />}
            title="Sugerencias de Calidad"
            active={activeTool === "quality"}
            onClick={() =>
              setActiveTool(activeTool === "quality" ? null : "quality")
            }
          >
            <QualitySuggestions testCases={testCases} />
          </ToolCard>

          {/* 4. Comparador */}
          <ToolCard
            icon={<GitCompare className="w-4 h-4 text-pink-400" />}
            title="Comparar Motores"
            active={activeTool === "compare"}
            onClick={() =>
              setActiveTool(activeTool === "compare" ? null : "compare")
            }
          >
            <CompareMode onCompare={handleCompare} isLoading={false} />
          </ToolCard>
        </div>
      </div>
    </>
  );
}

/* ── Tool Card (expandable) ── */
function ToolCard({
  icon,
  title,
  active,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all ${
        active
          ? "border-white/10 bg-white/[0.04]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03]"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
      >
        {icon}
        <span className="text-xs font-semibold text-white flex-1">{title}</span>
        <svg
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${active ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {active && (
        <div className="px-3 pb-3 border-t border-white/[0.04] pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
