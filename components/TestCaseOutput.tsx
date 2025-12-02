"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/StatsCards";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check,
  FileSpreadsheet,
  Code,
  List,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { GenerationResult, TestCase } from "@/app/page";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface TestCaseOutputProps {
  result: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
}

const priorityColors = {
  Alta: "bg-red-500/20 text-red-400 border-red-500/30",
  Media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Baja: "bg-green-500/20 text-green-400 border-green-500/30",
};

const typeIcons = {
  Positivo: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  Negativo: <XCircle className="w-4 h-4 text-red-400" />,
  Borde: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
};

export function TestCaseOutput({ result, isLoading, error }: TestCaseOutputProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGherkin, setCopiedGherkin] = useState(false);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyGherkin = async () => {
    if (result?.gherkin) {
      await navigator.clipboard.writeText(result.gherkin);
      setCopiedGherkin(true);
      setTimeout(() => setCopiedGherkin(false), 2000);
    }
  };

  const exportToExcel = () => {
    if (!result?.testCases) return;

    const data = result.testCases.map((tc) => ({
      ID: tc.id,
      Título: tc.title,
      Precondiciones: tc.preconditions,
      Pasos: tc.steps.join("\n"),
      "Resultado Esperado": tc.expectedResult,
      Prioridad: tc.priority,
      Tipo: tc.type,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Casos de Prueba");

    ws["!cols"] = [
      { wch: 8 },
      { wch: 40 },
      { wch: 30 },
      { wch: 50 },
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
    ];

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `casos-de-prueba-${Date.now()}.xlsx`);
  };

  // Loading State with animation
  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
            <div className="absolute inset-2 w-16 h-16 bg-violet-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Code className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-white font-medium">Analizando requisitos...</p>
          <p className="mt-2 text-slate-400 text-sm">
            Claude está generando casos de prueba exhaustivos
          </p>
          <div className="mt-4 flex gap-1">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="mt-6 text-white font-medium">Error al generar</p>
          <p className="mt-2 text-slate-400 text-sm max-w-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!result) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm h-full">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 relative">
            <List className="w-8 h-8 text-slate-500" />
            <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <p className="text-white font-medium">Sin casos de prueba</p>
          <p className="mt-2 text-slate-400 text-sm max-w-sm">
            Ingresá un requisito o historia de usuario y hacé clic en &quot;Generar&quot; 
            para crear casos de prueba automáticamente.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <div className="w-8 h-px bg-slate-700" />
            <span>Tip: Usá &quot;Cargar ejemplo&quot; para probar</span>
            <div className="w-8 h-px bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results State with animations
  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <div className="relative">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div className="absolute inset-0 w-5 h-5 bg-green-400/50 rounded-full animate-ping" />
            </div>
            Casos Generados
            <Badge variant="outline" className="ml-2 border-violet-500/30 bg-violet-500/10 text-violet-300">
              {result.testCases.length} casos
            </Badge>
          </CardTitle>
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 transition-all duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
        {result.summary && (
          <p className="text-sm text-slate-400 mt-2">{result.summary}</p>
        )}
      </CardHeader>
      <CardContent>
        {/* Stats Cards */}
        <StatsCards testCases={result.testCases} />

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger 
              value="table"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Tabla
            </TabsTrigger>
            <TabsTrigger 
              value="gherkin"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Code className="w-4 h-4 mr-2" />
              Gherkin
            </TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table" className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {result.testCases.map((tc: TestCase, index: number) => (
              <div
                key={tc.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TestCaseCard 
                  testCase={tc} 
                  onCopy={copyToClipboard}
                  isCopied={copiedId === tc.id}
                />
              </div>
            ))}
          </TabsContent>

          {/* Gherkin View */}
          <TabsContent value="gherkin" className="mt-4">
            <div className="relative group">
              <Button
                onClick={copyGherkin}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                {copiedGherkin ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-400" />
                    <span className="text-green-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
              <pre className="bg-slate-950/50 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto max-h-[500px] overflow-y-auto">
                <code className="language-gherkin">{result.gherkin}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TestCaseCard({ 
  testCase, 
  onCopy, 
  isCopied 
}: { 
  testCase: TestCase; 
  onCopy: (text: string, id: string) => void;
  isCopied: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTestCase = () => {
    return `${testCase.id}: ${testCase.title}
Precondiciones: ${testCase.preconditions}
Pasos:
${testCase.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
Resultado Esperado: ${testCase.expectedResult}`;
  };

  return (
    <div className={`
      bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 
      hover:border-violet-500/30 hover:bg-slate-800/70
      transition-all duration-300 
      ${isExpanded ? 'ring-1 ring-violet-500/20' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div 
          className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-shrink-0 mt-1 transition-transform duration-300 hover:scale-110">
            {typeIcons[testCase.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                {testCase.id}
              </span>
              <Badge 
                variant="outline" 
                className={`text-xs ${priorityColors[testCase.priority]} transition-all duration-300 hover:scale-105`}
              >
                {testCase.priority}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs border-slate-600 text-slate-400"
              >
                {testCase.type}
              </Badge>
            </div>
            <h4 className="text-white font-medium mt-1.5 group-hover:text-violet-300 transition-colors">
              {testCase.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onCopy(formatTestCase(), testCase.id)}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Content with animation */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
      `}>
        <div className="space-y-3 text-sm border-t border-slate-700/50 pt-4">
          {/* Preconditions */}
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-violet-400 font-medium text-xs uppercase tracking-wide">
              Precondiciones
            </span>
            <p className="text-slate-300 mt-1">{testCase.preconditions}</p>
          </div>

          {/* Steps */}
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-violet-400 font-medium text-xs uppercase tracking-wide">
              Pasos
            </span>
            <ol className="mt-2 space-y-2">
              {testCase.steps.map((step, index) => (
                <li key={index} className="text-slate-300 flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-violet-500/20 text-violet-400 rounded-full flex items-center justify-center text-xs font-mono">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Expected Result */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <span className="text-green-400 font-medium text-xs uppercase tracking-wide">
              Resultado Esperado
            </span>
            <p className="text-slate-300 mt-1">{testCase.expectedResult}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
