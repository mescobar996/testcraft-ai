"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Clock,
  FileText,
  ChevronRight,
  Search,
  Calendar,
  Loader2,
  AlertCircle,
  Cloud,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { getGenerations, deleteGeneration, HistoryRecord } from "@/lib/history-db";
import type { GenerationResult } from "@/types/testcase";

interface CloudHistoryTabProps {
  onSelect: (requirement: string, result: GenerationResult) => void;
  onNewGeneration?: HistoryRecord | null;
}

export function CloudHistoryTab({ onSelect, onNewGeneration }: CloudHistoryTabProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setError(t.mustSignInToViewHistory);
      return;
    }

    setIsLoading(true);
    setError(null);
    let timeoutReached = false;

    const timeoutId = setTimeout(() => {
      timeoutReached = true;
      setIsLoading(false);
      setError(t.timeoutError);
    }, 10000);

    try {
      const data = await getGenerations(user.id);

      if (!timeoutReached) {
        clearTimeout(timeoutId);
        setHistory(data);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (!timeoutReached) {
        const error = err as Error & { code?: string };
        console.error("Error loading history:", error);

        if (error?.message?.includes("JWT")) {
          setError(t.sessionExpiredError);
        } else if (error?.code === "PGRST116") {
          setError("La tabla 'generations' no existe. Contacta al soporte.");
        } else if (error?.message?.includes("permission")) {
          setError(t.noPermissionsError);
        } else {
          setError(`Error al cargar el historial: ${error?.message || "Desconocido"}`);
        }

        setIsLoading(false);
      }
    }
  }, [user, t]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  useEffect(() => {
    if (onNewGeneration) {
      const exists = history.some((h) => h.id === onNewGeneration.id);
      if (!exists) {
        setHistory((prev) => [onNewGeneration, ...prev]);
      }
    }
  }, [onNewGeneration, history]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const success = await deleteGeneration(user.id, id);
    if (success) {
      setHistory((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const handleSelect = (record: HistoryRecord) => {
    onSelect(record.requirement, record.result);
  };

  const filteredHistory = history.filter((record) =>
    record.requirement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0)
      return `${t.today} ${date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
    if (days === 1)
      return `${t.yesterday} ${date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`;
    if (days < 7) return `${days} ${t.daysAgo}`;
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mb-4">
          <LogIn className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Iniciá sesión</h3>
        <p className="text-sm text-zinc-500 max-w-xs">
          {t.mustSignInToViewHistory}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {history.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t.searchInHistory}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-colors"
          />
        </div>
      )}

      {/* Error state */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-medium mb-2">Error al cargar</p>
          <p className="text-zinc-500 text-sm mb-4 max-w-sm">{error}</p>
          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {t.retry}
          </button>
        </div>
      ) : isLoading ? (
        /* Loading state */
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-3" />
          <p className="text-sm text-zinc-500">{t.loadingHistory}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-white/[0.04] rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-zinc-700" />
          </div>
          <p className="text-white font-medium mb-1">
            {searchQuery ? t.noResults : t.noHistory}
          </p>
          <p className="text-zinc-500 text-sm">
            {searchQuery
              ? `${t.noResults} "${searchQuery}"`
              : t.yourGenerationsWillAppearHere}
          </p>
        </div>
      ) : (
        /* History list */
        <div className="space-y-2">
          {filteredHistory.map((record) => (
            <div
              key={record.id}
              onClick={() => handleSelect(record)}
              className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-violet-500/30 rounded-xl cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 bg-violet-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/15 transition-colors">
                <FileText className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate transition-colors">
                  {record.requirement.split("\n")[0].substring(0, 60)}
                  {record.requirement.length > 60 ? "..." : ""}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-zinc-600 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(record.created_at)}
                  </span>
                  <span className="text-emerald-500 text-xs">
                    {record.result.testCases?.length || 0} {t.cases}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDelete(record.id, e)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete all footer */}
      {history.length > 0 && !error && !isLoading && (
        <div className="pt-2 border-t border-white/[0.04]">
          <button
            type="button"
            onClick={() => {
              if (confirm(t.deleteAllHistoryConfirm)) {
                history.forEach((h) => deleteGeneration(user!.id, h.id));
                setHistory([]);
              }
            }}
            className="w-full py-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors text-sm font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
            {t.deleteAllHistory}
          </button>
        </div>
      )}
    </div>
  );
}
