"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Trash2,
  Search,
  FileText,
  Calendar,
  Loader2,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import type { TestCase } from "@/types/testcase";

interface FavoriteRecord {
  id: string;
  user_id: string;
  test_case: TestCase;
  created_at: string;
}

interface FavoritesTabProps {
  onSelectCase: (testCase: TestCase) => void;
}

export function FavoritesTab({ onSelectCase }: FavoritesTabProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadFavorites = useCallback(() => {
    if (!user) return;
    setIsLoading(true);
    try {
      const saved = localStorage.getItem(`favorites_${user.id}`);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handler = () => {
      if (user) loadFavorites();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [user, loadFavorites]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updated));
  };

  const handleSelect = (record: FavoriteRecord) => {
    onSelectCase(record.test_case);
  };

  const filteredFavorites = favorites.filter((record) =>
    record.test_case.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    if (days < 7) return `${days} ${t.daysAgo}`;
    return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  };

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
          <LogIn className="w-7 h-7 text-amber-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Iniciá sesión</h3>
        <p className="text-sm text-zinc-500 max-w-xs">
          Iniciá sesión para guardar y ver tus favoritos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {favorites.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t.searchInFavorites}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-colors"
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
          <p className="text-sm text-zinc-500">{t.loadingFavorites}</p>
        </div>
      ) : filteredFavorites.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-white/[0.04] rounded-full flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-zinc-700" />
          </div>
          <p className="text-white font-medium mb-1">
            {searchQuery ? t.noResults : t.noFavorites}
          </p>
          <p className="text-zinc-500 text-sm">
            {searchQuery
              ? `${t.noResults} "${searchQuery}"`
              : t.markCasesAsFavorites}
          </p>
        </div>
      ) : (
        /* Favorites list */
        <div className="space-y-2">
          {filteredFavorites.map((record) => (
            <div
              key={record.id}
              onClick={() => handleSelect(record)}
              className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-amber-500/30 rounded-xl cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/15 transition-colors">
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 group-hover:text-white truncate transition-colors">
                  {record.test_case.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-zinc-600 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(record.created_at)}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      record.test_case.type === "Positivo"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : record.test_case.type === "Negativo"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {record.test_case.type}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      record.test_case.priority === "Alta"
                        ? "bg-red-500/15 text-red-400"
                        : record.test_case.priority === "Media"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {record.test_case.priority}
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
      {favorites.length > 0 && !isLoading && (
        <div className="pt-2 border-t border-white/[0.04]">
          <button
            type="button"
            onClick={() => {
              if (confirm(t.deleteAllFavoritesConfirm)) {
                setFavorites([]);
                if (user) {
                  localStorage.removeItem(`favorites_${user.id}`);
                }
              }
            }}
            className="w-full py-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors text-sm font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
            {t.deleteAllFavorites}
          </button>
        </div>
      )}
    </div>
  );
}
