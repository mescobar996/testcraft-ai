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
        <>
          {/* Backdrop - Fondo blanco semi-transparente */}
          <div 
            className="fixed inset-0 z-[99] bg-white/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal con fondo sólido */}
          <div className="fixed inset-0 z-[100] flex flex-col">
            {/* Header fijo con fondo sólido */}
            <div className="bg-slate-900 border-b border-slate-700 shadow-xl">
              <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Historial en la Nube</h2>
                    <p className="text-sm text-slate-400">{history.length} generaciones guardadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('¿Eliminar todo el historial?')) {
                          history.forEach(h => deleteGeneration(user.id, h.id));
                          setHistory([]);
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
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cerrar
                  </Button>
                </div>
              </div>

              {/* Búsqueda */}
              {history.length > 3 && (
                <div className="px-4 pb-4 max-w-4xl mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar en historial..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contenido con fondo sólido */}
            <div className="flex-1 bg-slate-950 overflow-y-auto">
              <div className="p-4 max-w-4xl mx-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="text-lg">Cargando historial...</p>
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-white text-xl font-medium mb-2">{searchQuery ? 'Sin resultados' : 'Sin historial'}</p>
                    <p className="text-slate-400">
                      {searchQuery ? `No se encontraron generaciones para "${searchQuery}"` : 'Tus generaciones aparecerán aquí'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => handleSelect(record)}
                        className="group bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-xl p-5 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-violet-400 flex-shrink-0" />
                              <p className="text-white font-medium text-lg truncate">
                                {record.requirement.split('\n')[0].substring(0, 80)}
                                {record.requirement.length > 80 ? '...' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(record.created_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {record.result.testCases?.length || 0} casos generados
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
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
