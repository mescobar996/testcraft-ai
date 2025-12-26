"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  analyzeTestCases,
  filterBySeverity,
  getSuggestionCounts,
  type QualitySuggestion
} from "@/lib/ai-suggestions";
import type { TestCase } from "@/app/page";
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Copy,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";

interface QualitySuggestionsProps {
  testCases: TestCase[];
}

export function QualitySuggestions({ testCases }: QualitySuggestionsProps) {
  const { language } = useLanguage();
  const [suggestions, setSuggestions] = useState<QualitySuggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    if (testCases.length > 0) {
      const analysis = analyzeTestCases(testCases);
      setSuggestions(analysis);
    } else {
      setSuggestions([]);
    }
  }, [testCases]);

  if (testCases.length === 0) return null;

  const counts = getSuggestionCounts(suggestions);
  const filteredSuggestions = filterSeverity === 'all'
    ? suggestions
    : filterBySeverity(suggestions, filterSeverity);

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <Lightbulb className="w-4 h-4 text-violet-400" />;
      case 'duplicate':
        return <Copy className="w-4 h-4 text-orange-400" />;
      case 'coverage':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'clarity':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-green-300 mb-1">
            {language === "es" ? "¡Excelente calidad!" : "Excellent quality!"}
          </h4>
          <p className="text-xs text-green-400/80">
            {language === "es"
              ? "No se encontraron sugerencias de mejora. Tus casos de prueba tienen buena cobertura y claridad."
              : "No improvement suggestions found. Your test cases have good coverage and clarity."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {language === "es" ? "Sugerencias de Calidad" : "Quality Suggestions"}
            </h3>
            <p className="text-xs text-slate-400">
              {suggestions.length} {language === "es" ? "sugerencias encontradas" : "suggestions found"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <FilterButton
              active={filterSeverity === 'all'}
              onClick={() => setFilterSeverity('all')}
              count={suggestions.length}
            >
              {language === "es" ? "Todas" : "All"}
            </FilterButton>
            <FilterButton
              active={filterSeverity === 'high'}
              onClick={() => setFilterSeverity('high')}
              count={filterBySeverity(suggestions, 'high').length}
              color="red"
            >
              {language === "es" ? "Alta" : "High"}
            </FilterButton>
            <FilterButton
              active={filterSeverity === 'medium'}
              onClick={() => setFilterSeverity('medium')}
              count={filterBySeverity(suggestions, 'medium').length}
              color="yellow"
            >
              {language === "es" ? "Media" : "Medium"}
            </FilterButton>
            <FilterButton
              active={filterSeverity === 'low'}
              onClick={() => setFilterSeverity('low')}
              count={filterBySeverity(suggestions, 'low').length}
              color="blue"
            >
              {language === "es" ? "Baja" : "Low"}
            </FilterButton>
          </div>

          {/* Suggestions List */}
          <div className="space-y-2">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 border rounded-lg ${getSeverityColor(suggestion.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(suggestion.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(suggestion.type)}
                      <h4 className="text-sm font-semibold text-white">
                        {language === "es" ? suggestion.title : suggestion.titleEn}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 mb-2">
                      {language === "es" ? suggestion.description : suggestion.descriptionEn}
                    </p>

                    <div className="flex items-start gap-2 p-2 bg-slate-900/50 rounded border border-slate-700/50">
                      <Lightbulb className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400">
                        <strong className="text-violet-400">
                          {language === "es" ? "Sugerencia:" : "Suggestion:"}
                        </strong>{" "}
                        {language === "es" ? suggestion.suggestion : suggestion.suggestionEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {filteredSuggestions.length === 0 && (
            <p className="text-xs text-center text-slate-500 py-4">
              {language === "es"
                ? "No hay sugerencias con este nivel de severidad"
                : "No suggestions with this severity level"}
            </p>
          )}
        </>
      )}
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  count: number;
  color?: 'red' | 'yellow' | 'blue';
  children: React.ReactNode;
}

function FilterButton({ active, onClick, count, color, children }: FilterButtonProps) {
  const getColors = () => {
    if (!color) {
      return active
        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600';
    }

    const colors = {
      red: active
        ? 'bg-red-500/20 border-red-500/50 text-red-300'
        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-red-500/30',
      yellow: active
        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-yellow-500/30',
      blue: active
        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-blue-500/30'
    };

    return colors[color];
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${getColors()}`}
    >
      {children}
      <span className="ml-1.5 opacity-75">({count})</span>
    </button>
  );
}
