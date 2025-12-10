"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  GitCompare, 
  ArrowRight, 
  Plus, 
  Minus, 
  Equal,
  Loader2,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { TestCase, GenerationResult } from "@/app/page";

interface CompareModeProps {
  onCompare: (req1: string, req2: string, context: string) => Promise<{
    version1: GenerationResult;
    version2: GenerationResult;
  }>;
  isLoading: boolean;
}

interface ComparisonResult {
  added: TestCase[];      // Casos nuevos en v2
  removed: TestCase[];    // Casos que ya no están en v2
  modified: { v1: TestCase; v2: TestCase }[];  // Casos modificados
  unchanged: TestCase[];  // Casos sin cambios
}

export function CompareMode({ onCompare, isLoading }: CompareModeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [requirement1, setRequirement1] = useState("");
  const [requirement2, setRequirement2] = useState("");
  const [context, setContext] = useState("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [results, setResults] = useState<{ v1: GenerationResult; v2: GenerationResult } | null>(null);

  const compareTestCases = (v1Cases: TestCase[], v2Cases: TestCase[]): ComparisonResult => {
    const added: TestCase[] = [];
    const removed: TestCase[] = [];
    const modified: { v1: TestCase; v2: TestCase }[] = [];
    const unchanged: TestCase[] = [];

    // Encontrar casos por título similar
    const v1Titles = new Map(v1Cases.map(tc => [tc.title.toLowerCase().trim(), tc]));
    const v2Titles = new Map(v2Cases.map(tc => [tc.title.toLowerCase().trim(), tc]));

    // Verificar cada caso de v1
    v1Cases.forEach(tc1 => {
      const key = tc1.title.toLowerCase().trim();
      const tc2 = v2Titles.get(key);
      
      if (!tc2) {
        // Buscar por similitud parcial
        const similar = v2Cases.find(t => 
          t.title.toLowerCase().includes(key.substring(0, 20)) ||
          key.includes(t.title.toLowerCase().substring(0, 20))
        );
        
        if (similar) {
          modified.push({ v1: tc1, v2: similar });
          v2Titles.delete(similar.title.toLowerCase().trim());
        } else {
          removed.push(tc1);
        }
      } else {
        // Comparar contenido
        const stepsEqual = JSON.stringify(tc1.steps) === JSON.stringify(tc2.steps);
        const resultEqual = tc1.expectedResult === tc2.expectedResult;
        
        if (stepsEqual && resultEqual) {
          unchanged.push(tc1);
        } else {
          modified.push({ v1: tc1, v2: tc2 });
        }
        v2Titles.delete(key);
      }
    });

    // Casos restantes en v2 son nuevos
    v2Titles.forEach(tc => {
      added.push(tc);
    });

    return { added, removed, modified, unchanged };
  };

  const handleCompare = async () => {
    if (!requirement1.trim() || !requirement2.trim()) return;

    try {
      const result = await onCompare(requirement1, requirement2, context);
      setResults({ v1: result.version1, v2: result.version2 });
      
      const comparisonResult = compareTestCases(
        result.version1.testCases,
        result.version2.testCases
      );
      setComparison(comparisonResult);
    } catch (error) {
      console.error("Error comparing:", error);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-orange-400" />
          <span className="font-medium text-white">Modo Comparación</span>
          <span className="text-xs text-slate-400">(Comparar 2 versiones)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Two columns for requirements */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Version 1 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">V1</span>
                Requisito Original
              </label>
              <Textarea
                placeholder="Pegá el requisito de la versión original..."
                value={requirement1}
                onChange={(e) => setRequirement1(e.target.value)}
                className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Version 2 */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">V2</span>
                Requisito Nuevo
              </label>
              <Textarea
                placeholder="Pegá el requisito de la nueva versión..."
                value={requirement2}
                onChange={(e) => setRequirement2(e.target.value)}
                className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-green-500 resize-none"
              />
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Contexto (opcional)</label>
            <Textarea
              placeholder="Información adicional sobre el sistema..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[60px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Compare Button */}
          <Button
            onClick={handleCompare}
            disabled={!requirement1.trim() || !requirement2.trim() || isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-medium py-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Comparando versiones...
              </>
            ) : (
              <>
                <GitCompare className="w-5 h-5 mr-2" />
                Comparar Versiones
              </>
            )}
          </Button>

          {/* Results */}
          {comparison && results && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2">
                <StatCard 
                  icon={<Plus className="w-4 h-4" />}
                  label="Nuevos"
                  count={comparison.added.length}
                  color="green"
                />
                <StatCard 
                  icon={<Minus className="w-4 h-4" />}
                  label="Eliminados"
                  count={comparison.removed.length}
                  color="red"
                />
                <StatCard 
                  icon={<ArrowRight className="w-4 h-4" />}
                  label="Modificados"
                  count={comparison.modified.length}
                  color="yellow"
                />
                <StatCard 
                  icon={<Equal className="w-4 h-4" />}
                  label="Sin cambios"
                  count={comparison.unchanged.length}
                  color="slate"
                />
              </div>

              {/* Added Cases */}
              {comparison.added.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Casos Nuevos ({comparison.added.length})
                  </h4>
                  {comparison.added.map(tc => (
                    <CompareCard key={tc.id} testCase={tc} type="added" />
                  ))}
                </div>
              )}

              {/* Removed Cases */}
              {comparison.removed.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                    <Minus className="w-4 h-4" />
                    Casos Eliminados ({comparison.removed.length})
                  </h4>
                  {comparison.removed.map(tc => (
                    <CompareCard key={tc.id} testCase={tc} type="removed" />
                  ))}
                </div>
              )}

              {/* Modified Cases */}
              {comparison.modified.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Casos Modificados ({comparison.modified.length})
                  </h4>
                  {comparison.modified.map(({ v1, v2 }) => (
                    <ModifiedCard key={v1.id} v1={v1} v2={v2} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, count, color }: { 
  icon: React.ReactNode; 
  label: string; 
  count: number; 
  color: string;
}) {
  const colors: Record<string, string> = {
    green: "bg-green-500/10 text-green-400 border-green-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[color]} text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-xl font-bold">{count}</span>
      </div>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

function CompareCard({ testCase, type }: { testCase: TestCase; type: "added" | "removed" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const colors = type === "added" 
    ? "border-green-500/30 bg-green-500/5" 
    : "border-red-500/30 bg-red-500/5";

  return (
    <div className={`border rounded-lg ${colors} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30"
      >
        <span className="text-sm text-white">{testCase.title}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 text-xs text-slate-400 space-y-2">
          <p><strong>Pasos:</strong> {testCase.steps.join(" → ")}</p>
          <p><strong>Resultado:</strong> {testCase.expectedResult}</p>
        </div>
      )}
    </div>
  );
}

function ModifiedCard({ v1, v2 }: { v1: TestCase; v2: TestCase }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-yellow-500/30 bg-yellow-500/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30"
      >
        <span className="text-sm text-white">{v2.title}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <p className="text-blue-400 font-medium mb-1">V1 - Original</p>
              <p className="text-slate-400">{v1.steps.length} pasos</p>
              <p className="text-slate-400 truncate">{v1.expectedResult}</p>
            </div>
            <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
              <p className="text-green-400 font-medium mb-1">V2 - Nuevo</p>
              <p className="text-slate-400">{v2.steps.length} pasos</p>
              <p className="text-slate-400 truncate">{v2.expectedResult}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
