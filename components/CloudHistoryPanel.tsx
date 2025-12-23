"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  X,
  Trash2,
  Clock,
  FileText,
  ChevronRight,
  Search,
  Calendar,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getGenerations, deleteGeneration, HistoryRecord } from "@/lib/history-db";
import { GenerationResult } from "@/app/page";

interface CloudHistoryPanelProps {
  onSelect: (requirement: string, result: GenerationResult) => void;
  onNewGeneration?: HistoryRecord | null;
}

export function CloudHistoryPanel({ onSelect, onNewGeneration }: CloudHistoryPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getGenerations(user.id);
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isOpen) {
      loadHistory();
    }
  }, [user, isOpen, loadHistory]);

  useEffect(() => {
    if (onNewGeneration) {
      const exists = history.some(h => h.id === onNewGeneration.id);
      if (!exists) {
        setHistory(prev => [onNewGeneration, ...prev]);
      }
    }
  }, [onNewGeneration, history]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const success = await deleteGeneration(user.id, id);
    if (success) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  const handleSelect = (record: HistoryRecord) => {
    onSelect(record.requirement, record.result);
    setIsOpen(false);
  };

  const filteredHistory = history.filter(record =>
    record.requirement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return `Hoy ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return `Ayer ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  if (!user) {
    return (
      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setIsOpen(true)}>
        <Cloud className="w-4 h-4 mr-2" /> Historial
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white relative" onClick={() => setIsOpen(true)}>
        <Cloud className="w-4 h-4 mr-2" /> Historial
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-xs flex items-center justify-center text-white">
            {history.length > 99 ? '99+' : history.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Modal - Mobile: fullscreen | Desktop: centrado */}
          <div className="fixed inset-0 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[80vh] bg-slate-900 sm:rounded-2xl sm:border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header con gradiente azul */}
            <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-5 sm:p-6 text-center flex-shrink-0">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Historial en la Nube</h2>
              <p className="text-blue-100 text-sm">{history.length} generaciones guardadas</p>
            </div>

            {/* Búsqueda */}
            {history.length > 3 && (
              <div className="p-4 border-b border-slate-800 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar en historial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                  <p>Cargando historial...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-white text-lg font-semibold mb-1">{searchQuery ? 'Sin resultados' : 'Sin historial'}</p>
                  <p className="text-slate-400 text-sm">
                    {searchQuery ? `No hay resultados para "${searchQuery}"` : 'Tus generaciones aparecerán aquí'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleSelect(record)}
                      className="flex items-center gap-3 sm:gap-4 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {record.requirement.split('\n')[0].substring(0, 50)}...
                        </p>
                        <p className="text-slate-400 text-xs flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(record.created_at)}
                          <span className="text-green-400">• {record.result.testCases?.length || 0} casos</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDelete(record.id, e)}
                          className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Eliminar todo el historial?')) {
                      history.forEach(h => deleteGeneration(user.id, h.id));
                      setHistory([]);
                    }
                  }}
                  className="w-full py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Eliminar todo el historial
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
