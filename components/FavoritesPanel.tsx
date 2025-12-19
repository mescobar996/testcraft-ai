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
        <div 
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          {/* OVERLAY - Fondo blanco semi-transparente */}
          <div 
            className="fixed inset-0 bg-white/25 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* MODAL */}
          {/* Mobile: pantalla completa | Desktop: 90% ancho, 85% alto, centrado */}
          <div className="fixed inset-0 md:inset-auto md:top-[7.5%] md:left-[5%] md:right-[5%] md:bottom-[7.5%] bg-slate-900 md:rounded-2xl border-0 md:border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-700 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Casos Favoritos</h2>
                  <p className="text-xs md:text-sm text-slate-400">{favorites.length} casos guardados</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {favorites.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm('¿Eliminar todos los favoritos?')) {
                        setFavorites([]);
                        if (user) {
                          localStorage.removeItem(`favorites_${user.id}`);
                        }
                      }
                    }} 
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Eliminar todo</span>
                  </button>
                )}
                
                {/* BOTÓN CERRAR */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm">Cerrar</span>
                </button>
              </div>
            </div>

            {/* BÚSQUEDA */}
            {favorites.length > 3 && (
              <div className="p-4 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar en favoritos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* CONTENIDO */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-yellow-500" />
                  <p className="text-lg">Cargando favoritos...</p>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-white text-xl font-semibold mb-2">
                    {searchQuery ? 'Sin resultados' : 'Sin favoritos'}
                  </p>
                  <p className="text-slate-400">
                    {searchQuery 
                      ? `No hay resultados para "${searchQuery}"` 
                      : 'Marcá casos como favoritos para verlos aquí'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFavorites.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleSelect(record)}
                      className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-yellow-500/50 rounded-xl p-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            <p className="text-white font-medium truncate">
                              {record.test_case.title}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
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
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
