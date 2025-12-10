"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { 
  getGenerations, 
  deleteGeneration, 
  clearAllGenerations,
  HistoryRecord 
} from "@/lib/history-db";
import { GenerationResult } from "@/app/page";
import { 
  History, 
  Trash2, 
  Clock,
  FileText,
  X,
  Cloud,
  CloudOff,
  Loader2,
  AlertCircle,
  ChevronRight
} from "lucide-react";

interface CloudHistoryPanelProps {
  onSelect: (requirement: string, result: GenerationResult) => void;
  onNewGeneration?: HistoryRecord | null;
}

export function CloudHistoryPanel({ onSelect, onNewGeneration }: CloudHistoryPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar historial cuando se abre el panel
  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  // Agregar nueva generación al historial
  useEffect(() => {
    if (onNewGeneration) {
      setHistory(prev => [onNewGeneration, ...prev]);
    }
  }, [onNewGeneration]);

  const loadHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getGenerations(user.id);
      setHistory(data);
    } catch (err) {
      setError('Error al cargar el historial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const success = await deleteGeneration(user.id, id);
    if (success) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (!user) return;
    
    const confirmed = window.confirm('¿Eliminar todo el historial? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    
    const success = await clearAllGenerations(user.id);
    if (success) {
      setHistory([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Si no hay usuario, mostrar mensaje
  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="border-slate-700 bg-slate-800/50 text-slate-500"
      >
        <CloudOff className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Historial</span>
      </Button>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
      >
        <Cloud className="w-4 h-4 mr-2 text-blue-400" />
        <span className="hidden sm:inline">Historial</span>
        {history.length > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
            {history.length}
          </span>
        )}
      </Button>

      {/* Slide-out Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-96 max-w-full bg-slate-900 border-l border-slate-800 shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold text-white">Historial en la Nube</h2>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <Button
                    onClick={handleClearAll}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Cargando historial...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-400">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">{error}</p>
                  <Button
                    onClick={loadHistory}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <History className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm font-medium">Sin historial</p>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Tus generaciones se guardarán aquí automáticamente
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/30 rounded-lg p-3 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        onSelect(item.requirement, item.result);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <span className="text-sm text-white font-medium truncate">
                              {truncateText(item.requirement.split('\n')[0], 40)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(item.created_at)}
                            </span>
                            <span>{item.result.testCases.length} casos</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
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
            <div className="p-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Sincronizado con tu cuenta • {history.length} generaciones
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
