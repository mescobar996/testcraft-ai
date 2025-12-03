"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getFavorites, removeFavorite, FavoriteCase } from "@/lib/favorites-db";
import { TestCase } from "@/app/page";
import {
  Star,
  Trash2,
  X,
  Loader2,
  ChevronRight,
  Clock,
  Copy,
  Check,
} from "lucide-react";

interface FavoritesPanelProps {
  onSelectCase: (testCase: TestCase) => void;
}

export function FavoritesPanel({ onSelectCase }: FavoritesPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadFavorites();
    }
  }, [isOpen, user]);

  const loadFavorites = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getFavorites(user.id);
      setFavorites(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!user) return;
    const success = await removeFavorite(user.id, id);
    if (success) {
      setFavorites(prev => prev.filter(f => f.id !== id));
    }
  };

  const copyToClipboard = async (tc: TestCase) => {
    const text = `${tc.id} - ${tc.title}
Tipo: ${tc.type} | Prioridad: ${tc.priority}
Precondiciones: ${tc.preconditions}
Pasos:
${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
Resultado Esperado: ${tc.expectedResult}`;
    
    await navigator.clipboard.writeText(text);
    setCopiedId(tc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="border-slate-700 bg-slate-800/50 text-slate-500"
      >
        <Star className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Favoritos</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
      >
        <Star className="w-4 h-4 mr-2 text-yellow-400" />
        <span className="hidden sm:inline">Favoritos</span>
        {favorites.length > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            {favorites.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed inset-y-0 right-0 z-50 w-96 max-w-full bg-slate-900 border-l border-slate-800 shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="font-semibold text-white">Casos Favoritos</h2>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Cargando favoritos...</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Star className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">Sin favoritos</p>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Marcá casos de prueba con ⭐ para guardarlos aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500/30 rounded-lg p-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {fav.test_case.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {fav.requirement_title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              fav.test_case.type === "Positivo"
                                ? "border-green-500/50 text-green-400"
                                : fav.test_case.type === "Negativo"
                                ? "border-red-500/50 text-red-400"
                                : "border-yellow-500/50 text-yellow-400"
                            }`}
                          >
                            {fav.test_case.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(fav.created_at)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(fav.test_case)}
                            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-all"
                            title="Copiar"
                          >
                            {copiedId === fav.test_case.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemove(fav.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              onSelectCase(fav.test_case);
                              setIsOpen(false);
                            }}
                            className="p-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded transition-all"
                            title="Ver detalle"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                {favorites.length} caso{favorites.length !== 1 ? 's' : ''} guardado{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
