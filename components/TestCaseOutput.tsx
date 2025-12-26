"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Check,
  FileText,
  Code,
  AlertCircle,
  ListChecks,
  Filter,
  Search,
  ChevronsUpDown,
  X,
  ArrowUpDown,
  CopyCheck,
} from "lucide-react";
import { GenerationResult, TestCase } from "@/app/page";
import { StatsCards } from "@/components/StatsCards";
import { ExportMenu } from "@/components/ExportMenu";
import { ExportWithTemplates } from "@/components/ExportWithTemplates";
import { EditableTestCase } from "@/components/EditableTestCase";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { TestPlanModal } from "@/components/TestPlanModal";
import { ExecutionEstimate } from "@/components/ExecutionEstimate";
import { useAuth } from "@/lib/auth-context";
import { addFavorite } from "@/lib/favorites-db";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/lib/language-context";
import { QualitySuggestions } from "@/components/QualitySuggestions";
import { JiraExportButton } from "@/components/JiraExportButton";

interface TestCaseOutputProps {
  result: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
  requirementTitle?: string;
  onRegenerateCase?: (testCase: TestCase) => Promise<TestCase | null>;
  onUpdateResult?: (result: GenerationResult) => void;
}

type FilterType = "all" | "Positivo" | "Negativo" | "Borde";
type SortType = "default" | "priority" | "type" | "id";

const priorityOrder = { "Alta": 1, "Media": 2, "Baja": 3 };
const typeOrder = { "Positivo": 1, "Negativo": 2, "Borde": 3 };

export function TestCaseOutput({ 
  result, 
  isLoading, 
  error, 
  requirementTitle,
  onRegenerateCase,
  onUpdateResult
}: TestCaseOutputProps) {
  const { user } = useAuth();
  const { showCopyToast, showFavoriteToast, showToast } = useToast();
  const { t } = useLanguage();
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
    setAllExpanded(false);
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
${t.typeLabel} ${tc.type} | ${t.priorityLabel} ${tc.priority}
${t.preconditionsLabel} ${tc.preconditions}
${t.stepsLabel}
${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
${t.expectedResultLabel} ${tc.expectedResult}`;
  };

  const copyAllCases = async () => {
    if (!result) return;
    
    const allText = result.testCases.map(tc => formatTestCaseForCopy(tc)).join("\n\n" + "=".repeat(50) + "\n\n");
    await navigator.clipboard.writeText(allText);
    showToast(`${result.testCases.length} ${t.casesCopied}`, "success", <CopyCheck className="w-4 h-4" />);
  };

  const handleFavorite = async (tc: TestCase) => {
    if (!user) return;

    const title = requirementTitle || t.noTitle;
    const saved = await addFavorite(user.id, tc, title);
    
    if (saved) {
      setFavoritedIds(prev => new Set([...prev, tc.id]));
      showFavoriteToast();
    }
  };

  const handleUpdateCase = (updated: TestCase) => {
    if (!result || !onUpdateResult) return;
    
    const newCases = result.testCases.map(tc => tc.id === updated.id ? updated : tc);
    onUpdateResult({ ...result, testCases: newCases });
  };

  const handleRegenerate = async (tc: TestCase): Promise<TestCase | null> => {
    if (!onRegenerateCase) return null;
    return await onRegenerateCase(tc);
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
      case "priority": return t.sortPriority;
      case "type": return t.sortType;
      case "id": return t.sortId;
      default: return t.sort;
    }
  };

  const filteredTestCases = useMemo(() => {
    if (!result) return [];
    
    let filtered = [...result.testCases];
    
    if (activeFilter !== "all") {
      filtered = filtered.filter(tc => tc.type === activeFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tc => 
        tc.title.toLowerCase().includes(query) ||
        tc.preconditions.toLowerCase().includes(query) ||
        tc.steps.some(step => step.toLowerCase().includes(query)) ||
        tc.expectedResult.toLowerCase().includes(query)
      );
    }

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
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 sm:p-5 md:p-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium text-sm sm:text-base">{t.errorTitle}</p>
            <p className="text-red-300/80 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 sm:p-7 md:p-8 border-dashed">
        <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-800 rounded-full flex items-center justify-center">
            <ListChecks className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-slate-600" />
          </div>
          <div>
            <p className="text-white font-medium text-sm sm:text-base">{t.noTestCases}</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.noTestCasesDesc}</p>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500">{t.noTestCasesTip}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <StatsCards testCases={result.testCases} />

      <ExecutionEstimate testCases={result.testCases} />

      {/* Botones de acción - Primera fila */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <ExportWithTemplates
          testCases={result.testCases}
          gherkin={result.gherkin}
          onExportPDF={exportToPDF}
        />
        <ExportMenu
          testCases={result.testCases}
          gherkin={result.gherkin}
          onExportPDF={exportToPDF}
        />
        <TestPlanModal
          testCases={result.testCases}
          requirement={requirementTitle || ""}
          gherkin={result.gherkin}
          summary={result.summary}
        />
        <JiraExportButton testCases={result.testCases} />
      </div>

      {/* Botones de acción - Segunda fila */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <Button
          onClick={() => copyToClipboard(result.gherkin, "gherkin-all")}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white text-xs sm:text-sm"
        >
          {copiedId === "gherkin-all" ? (
            <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-400" />
          ) : (
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          )}
          {t.copyGherkin}
        </Button>
        <Button
          onClick={copyAllCases}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white text-xs sm:text-sm"
        >
          <CopyCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {t.copyAll}
        </Button>
      </div>

      {/* Botones de acción - Tercera fila */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <Button
          onClick={toggleExpandAll}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white text-xs sm:text-sm"
        >
          <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {allExpanded ? t.collapse : t.expand}
        </Button>
        <Button
          onClick={cycleSortOrder}
          variant="outline"
          size="sm"
          className={`border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white text-xs sm:text-sm ${
            sortBy !== "default" ? "border-violet-500/50 text-violet-300" : ""
          }`}
        >
          <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {getSortLabel()}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 text-xs sm:text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
        <span className="text-xs sm:text-sm text-slate-400 mr-0.5 sm:mr-1">{t.filter}</span>
        {[
          { key: "all", label: t.all, count: result.testCases.length },
          { key: "Positivo", label: t.positive, count: result.testCases.filter(tc => tc.type === "Positivo").length },
          { key: "Negativo", label: t.negative, count: result.testCases.filter(tc => tc.type === "Negativo").length },
          { key: "Borde", label: t.edge, count: result.testCases.filter(tc => tc.type === "Borde").length },
        ].map(filter => (
          <Button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as FilterType)}
            variant="outline"
            size="sm"
            className={`text-[10px] sm:text-xs ${
              activeFilter === filter.key
                ? filter.key === "Positivo" ? "bg-green-500/20 border-green-500/50 text-green-400" :
                  filter.key === "Negativo" ? "bg-red-500/20 border-red-500/50 text-red-400" :
                  filter.key === "Borde" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                  "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {filter.label}
            <span className="ml-1 sm:ml-1.5 opacity-70">({filter.count})</span>
          </Button>
        ))}
      </div>

      {(searchQuery || sortBy !== "default") && (
        <p className="text-xs sm:text-sm text-slate-400">
          {filteredTestCases.length} {t.results}
          {searchQuery && ` para "${searchQuery}"`}
          {sortBy !== "default" && ` • ${t.orderedBy} ${getSortLabel().toLowerCase()}`}
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
          {/* Quality Suggestions */}
          <QualitySuggestions testCases={result.testCases} />

          {filteredTestCases.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 text-center">
              <p className="text-slate-400">
                {searchQuery ? `${t.noResults} para "${searchQuery}"` : t.noResults}
              </p>
            </div>
          ) : (
            filteredTestCases.map((tc, index) => (
              <div
                key={tc.id}
                className="animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <EditableTestCase
                  testCase={tc}
                  isExpanded={expandedCases.has(tc.id)}
                  onToggleExpand={() => toggleExpand(tc.id)}
                  onCopy={() => copyToClipboard(formatTestCaseForCopy(tc), tc.id)}
                  onFavorite={() => handleFavorite(tc)}
                  onUpdate={handleUpdateCase}
                  onRegenerate={handleRegenerate}
                  isCopied={copiedId === tc.id}
                  isFavorited={favoritedIds.has(tc.id)}
                  canFavorite={!!user}
                />
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
        <p className="text-xs text-slate-400 mb-1">{t.summary}</p>
        <p className="text-sm text-slate-300">{result.summary}</p>
      </div>
    </div>
  );
}
