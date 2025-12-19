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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay de fondo */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Casos Favoritos</h2>
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
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar todo
                  </Button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Búsqueda */}
            {favorites.length > 3 && (
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar en favoritos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
            )}

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-yellow-500" />
                  <p className="text-lg">Cargando favoritos...</p>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-white text-xl font-semibold mb-2">
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
                      className="group bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <p className="text-white font-medium truncate">
                              {record.test_case.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-4 h-4" />
                              {formatDate(record.created_at)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              record.test_case.type === 'Positivo' ? 'bg-green-500/20 text-green-400' :
                              record.test_case.type === 'Negativo' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {record.test_case.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              record.test_case.priority === 'Alta' ? 'bg-red-500/20 text-red-400' :
                              record.test_case.priority === 'Media' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {record.test_case.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDelete(record.id, e)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
        </div>
      )}
    </>
  );
}
