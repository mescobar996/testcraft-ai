"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Star,
  X,
  Trash2,
  Search,
  FileText,
  Calendar,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { TestCase } from "@/app/page";

interface FavoriteRecord {
  id: string;
  user_id: string;
  test_case: TestCase;
  created_at: string;
}

interface FavoritesPanelProps {
  onSelectCase?: (testCase: TestCase) => void;
}

export function FavoritesPanel({ onSelectCase }: FavoritesPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      loadFavorites();
    }
  }, [user, isOpen]);

  const loadFavorites = async () => {
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
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updated));
  };

  const handleSelect = (record: FavoriteRecord) => {
    if (onSelectCase) {
      onSelectCase(record.test_case);
    }
    setIsOpen(false);
  };

  const filteredFavorites = favorites.filter(record =>
    record.test_case.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-slate-400 hover:text-white relative" 
        onClick={() => setIsOpen(true)}
      >
        <Star className="w-4 h-4 mr-2" /> Favoritos
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full text-xs flex items-center justify-center text-black font-medium">
            {favorites.length > 99 ? '99+' : favorites.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white/30 backdrop-blur-md">
          {/* Header fijo */}
          <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700 z-10">
            <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Casos Favoritos</h2>
                  <p className="text-sm text-slate-400">{favorites.length} casos guardados</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {favorites.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (confirm('¿Eliminar todos los favoritos?')) {
                        setFavorites([]);
                        if (user) {
                          localStorage.removeItem(`favorites_${user.id}`);
                        }
                      }
                    }} 
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar todo
                  </Button>
                )}
                <Button 
                  onClick={() => setIsOpen(false)} 
                  variant="outline"
                  size="sm"
                  className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cerrar
                </Button>
              </div>
            </div>

            {/* Búsqueda */}
            {favorites.length > 3 && (
              <div className="px-4 pb-4 max-w-4xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar en favoritos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contenido scrolleable */}
          <div className="overflow-y-auto p-4 max-w-4xl mx-auto" style={{ height: 'calc(100vh - 140px)' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-lg">Cargando favoritos...</p>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-white text-xl font-medium mb-2">
                  {searchQuery ? 'Sin resultados' : 'Sin favoritos'}
                </p>
                <p className="text-slate-400">
                  {searchQuery 
                    ? `No se encontraron favoritos para "${searchQuery}"` 
                    : 'Marcá casos como favoritos para verlos aquí'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFavorites.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => handleSelect(record)}
                    className="group bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500/50 rounded-xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          <p className="text-white font-medium text-lg truncate">
                            {record.test_case.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(record.created_at)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.test_case.type === 'Positivo' ? 'bg-green-500/20 text-green-400' :
                            record.test_case.type === 'Negativo' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {record.test_case.type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.test_case.priority === 'Alta' ? 'bg-red-500/20 text-red-400' :
                            record.test_case.priority === 'Media' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            Prioridad {record.test_case.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleDelete(record.id, e)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
