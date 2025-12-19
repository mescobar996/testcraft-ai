"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (user && isOpen) {
      loadHistory();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (onNewGeneration) {
      const exists = history.some(h => h.id === onNewGeneration.id);
      if (!exists) {
        setHistory(prev => [onNewGeneration, ...prev]);
      }
    }
  }, [onNewGeneration]);

  const loadHistory = async () => {
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
  };

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header con botón X siempre visible */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Historial en la Nube</h2>
                  <p className="text-sm text-slate-400">Sincronizado • {history.length} generaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (confirm('¿Eliminar todo el historial?')) {
                      history.forEach(h => deleteGeneration(user.id, h.id));
                      setHistory([]);
                    }
                  }} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Búsqueda */}
            {history.length > 3 && (
              <div className="p-4 border-b border-slate-800 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar en historial..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p>Cargando historial...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-white font-medium mb-1">{searchQuery ? 'Sin resultados' : 'Sin historial'}</p>
                  <p className="text-slate-400 text-sm">
                    {searchQuery ? `No se encontraron generaciones para "${searchQuery}"` : 'Tus generaciones aparecerán aquí'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((record, index) => (
                    <div
                      key={record.id}
                      onClick={() => handleSelect(record)}
                      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-lg p-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <p className="text-white font-medium truncate">
                              {record.requirement.split('\n')[0].substring(0, 60)}
                              {record.requirement.length > 60 ? '...' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(record.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {record.result.testCases?.length || 0} casos
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDelete(record.id, e)}
                            className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-800/30 flex-shrink-0">
              <p className="text-xs text-slate-500 text-center">
                El historial se sincroniza automáticamente con tu cuenta
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
