"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
  Code,
  AlertCircle,
  ListChecks,
  Filter,
  Star,
  Search,
  ChevronsUpDown,
  X,
  ArrowUpDown,
  CopyCheck,
} from "lucide-react";
import { GenerationResult, TestCase } from "@/app/page";
import { StatsCards } from "@/components/StatsCards";
import { ExportMenu } from "@/components/ExportMenu";
import { useAuth } from "@/lib/auth-context";
import { addFavorite } from "@/lib/favorites-db";
import { useToast } from "@/components/Toast";

interface TestCaseOutputProps {
  result: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
  requirementTitle?: string;
}

type FilterType = "all" | "Positivo" | "Negativo" | "Borde";
type SortType = "default" | "priority" | "type" | "id";

const priorityOrder = { "Alta": 1, "Media": 2, "Baja": 3 };
const typeOrder = { "Positivo": 1, "Negativo": 2, "Borde": 3 };

export function TestCaseOutput({ result, isLoading, error, requirementTitle }: TestCaseOutputProps) {
  const { user } = useAuth();
  const { showCopyToast, showFavoriteToast, showToast } = useToast();
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [allExpanded, setAllExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>("default");

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCases(newExpanded);
  };

  const toggleExpandAll = () => {
    if (!result) return;
    
    if (allExpanded) {
      setExpandedCases(new Set());
      setAllExpanded(false);
    } else {
      const allIds = new Set(result.testCases.map(tc => tc.id));
      setExpandedCases(allIds);
      setAllExpanded(true);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    showCopyToast();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTestCaseForCopy = (tc: TestCase) => {
    return `${tc.id} - ${tc.title}
Tipo: ${tc.type} | Prioridad: ${tc.priority}
Precondiciones: ${tc.preconditions}
Pasos:
${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
Resultado Esperado: ${tc.expectedResult}`;
  };

  const copyAllCases = async () => {
    if (!result) return;
    
    const allText = result.testCases.map(tc => formatTestCaseForCopy(tc)).join("\n\n" + "=".repeat(50) + "\n\n");
    await navigator.clipboard.writeText(allText);
    showToast(`${result.testCases.length} casos copiados`, "success", <CopyCheck className="w-4 h-4" />);
  };

  const handleFavorite = async (tc: TestCase) => {
    if (!user) return;
    
    const title = requirementTitle || "Sin título";
    const saved = await addFavorite(user.id, tc, title);
    
    if (saved) {
      setFavoritedIds(prev => new Set([...prev, tc.id]));
      showFavoriteToast();
    }
  };

  const exportToPDF = async () => {
    if (!result) return;
    const { generatePDF } = await import('@/lib/generate-pdf');
    generatePDF({
      testCases: result.testCases,
      gherkin: result.gherkin,
      summary: result.summary,
      requirement: ''
    });
  };

  const cycleSortOrder = () => {
    const orders: SortType[] = ["default", "priority", "type", "id"];
    const currentIndex = orders.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % orders.length;
    setSortBy(orders[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "priority": return "Prioridad";
      case "type": return "Tipo";
      case "id": return "ID";
      default: return "Ordenar";
    }
  };

  // Filtrar y ordenar casos
  const filteredTestCases = useMemo(() => {
    if (!result) return [];
    
    let filtered = [...result.testCases];
    
    // Filtrar por tipo
    if (activeFilter !== "all") {
      filtered = filtered.filter(tc => tc.type === activeFilter);
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tc => 
        tc.title.toLowerCase().includes(query) ||
        tc.preconditions.toLowerCase().includes(query) ||
        tc.steps.some(step => step.toLowerCase().includes(query)) ||
        tc.expectedResult.toLowerCase().includes(query)
      );
    }

    // Ordenar
    if (sortBy === "priority") {
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "type") {
      filtered.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
    } else if (sortBy === "id") {
      filtered.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    return filtered;
  }, [result, activeFilter, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-medium">Generando casos de prueba...</p>
            <p className="text-sm text-slate-400 mt-1">Analizando requisitos con IA</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error al generar</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 border-dashed">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
            <ListChecks className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <p className="text-white font-medium">Sin casos de prueba</p>
            <p className="text-sm text-slate-400 mt-1">
              Ingresá un requisito o historia de usuario y hacé clic en
              &quot;Generar&quot; para crear casos de prueba automáticamente.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Tip: Usá &quot;Cargar ejemplo&quot; para probar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatsCards testCases={result.testCases} />

      {/* Export & Actions Row 1 */}
      <div className="flex gap-2 flex-wrap">
        <ExportMenu 
          testCases={result.testCases} 
          gherkin={result.gherkin}
          onExportPDF={exportToPDF}
        />
        <Button
          onClick={() => copyToClipboard(result.gherkin, "gherkin-all")}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          {copiedId === "gherkin-all" ? (
            <Check className="w-4 h-4 mr-2 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          Copiar Gherkin
        </Button>
        <Button
          onClick={copyAllCases}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <CopyCheck className="w-4 h-4 mr-2" />
          Copiar Todos
        </Button>
      </div>

      {/* Actions Row 2 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={toggleExpandAll}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <ChevronsUpDown className="w-4 h-4 mr-2" />
          {allExpanded ? "Colapsar" : "Expandir"}
        </Button>
        <Button
          onClick={cycleSortOrder}
          variant="outline"
          size="sm"
          className={`border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white ${
            sortBy !== "default" ? "border-violet-500/50 text-violet-300" : ""
          }`}
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {getSortLabel()}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar en casos de prueba..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400 mr-1">Filtrar:</span>
        {[
          { key: "all", label: "Todos", count: result.testCases.length },
          { key: "Positivo", label: "Positivos", count: result.testCases.filter(tc => tc.type === "Positivo").length },
          { key: "Negativo", label: "Negativos", count: result.testCases.filter(tc => tc.type === "Negativo").length },
          { key: "Borde", label: "Borde", count: result.testCases.filter(tc => tc.type === "Borde").length },
        ].map(filter => (
          <Button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as FilterType)}
            variant="outline"
            size="sm"
            className={`text-xs ${
              activeFilter === filter.key
                ? filter.key === "Positivo" ? "bg-green-500/20 border-green-500/50 text-green-400" :
                  filter.key === "Negativo" ? "bg-red-500/20 border-red-500/50 text-red-400" :
                  filter.key === "Borde" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                  "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 opacity-70">({filter.count})</span>
          </Button>
        ))}
      </div>

      {/* Results info */}
      {(searchQuery || sortBy !== "default") && (
        <p className="text-sm text-slate-400">
          {filteredTestCases.length} resultado{filteredTestCases.length !== 1 ? 's' : ''}
          {searchQuery && ` para "${searchQuery}"`}
          {sortBy !== "default" && ` • Ordenado por ${getSortLabel().toLowerCase()}`}
        </p>
      )}

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="table"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            <FileText className="w-4 h-4 mr-2" />
            Tabla
          </TabsTrigger>
          <TabsTrigger
            value="gherkin"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            <Code className="w-4 h-4 mr-2" />
            Gherkin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4 space-y-3">
          {filteredTestCases.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400">
                {searchQuery ? `No se encontraron casos para "${searchQuery}"` : `No hay casos de tipo "${activeFilter}"`}
              </p>
            </div>
          ) : (
            filteredTestCases.map((tc, index) => (
              <div
                key={tc.id}
                className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => toggleExpand(tc.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono">{tc.id}</span>
                    <span className="text-white font-medium text-left">{tc.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        tc.type === "Positivo"
                          ? "border-green-500/50 text-green-400"
                          : tc.type === "Negativo"
                          ? "border-red-500/50 text-red-400"
                          : "border-yellow-500/50 text-yellow-400"
                      }`}
                    >
                      {tc.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        tc.priority === "Alta"
                          ? "border-red-500/50 text-red-400"
                          : tc.priority === "Media"
                          ? "border-yellow-500/50 text-yellow-400"
                          : "border-green-500/50 text-green-400"
                      }`}
                    >
                      {tc.priority}
                    </Badge>
                    {expandedCases.has(tc.id) ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {expandedCases.has(tc.id) && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                    {tc.preconditions && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Precondiciones</p>
                        <p className="text-sm text-slate-300">{tc.preconditions}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-slate-400 mb-2">Pasos</p>
                      <ol className="space-y-1">
                        {tc.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-violet-400 font-mono">{i + 1}.</span>
                            <span className="text-slate-300">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 mb-1">Resultado Esperado</p>
                      <p className="text-sm text-green-400">{tc.expectedResult}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={() => copyToClipboard(formatTestCaseForCopy(tc), tc.id)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedId === tc.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-400" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </>
                        )}
                      </Button>
                      
                      {user && (
                        <Button
                          onClick={() => handleFavorite(tc)}
                          variant="ghost"
                          size="sm"
                          disabled={favoritedIds.has(tc.id)}
                          className={`${
                            favoritedIds.has(tc.id)
                              ? "text-yellow-400"
                              : "text-slate-400 hover:text-yellow-400"
                          }`}
                        >
                          <Star className={`w-4 h-4 mr-2 ${favoritedIds.has(tc.id) ? "fill-yellow-400" : ""}`} />
                          {favoritedIds.has(tc.id) ? "Guardado" : "Favorito"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="gherkin" className="mt-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
              {result.gherkin}
            </pre>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-4">
        <p className="text-xs text-slate-400 mb-1">Resumen</p>
        <p className="text-sm text-slate-300">{result.summary}</p>
      </div>
    </div>
  );
}
