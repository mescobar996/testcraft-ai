"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Check, X, AlertCircle, Info, Copy, Star, Download } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: ReactNode;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, icon?: ReactNode) => void;
  showCopyToast: () => void;
  showFavoriteToast: () => void;
  showExportToast: (format: string) => void;
  showErrorToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success", icon?: ReactNode) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, icon };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const showCopyToast = useCallback(() => {
    showToast("Copiado al portapapeles", "success", <Copy className="w-4 h-4" />);
  }, [showToast]);

  const showFavoriteToast = useCallback(() => {
    showToast("Guardado en favoritos", "success", <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
  }, [showToast]);

  const showExportToast = useCallback((format: string) => {
    showToast(`Exportado a ${format}`, "success", <Download className="w-4 h-4" />);
  }, [showToast]);

  const showErrorToast = useCallback((message: string) => {
    showToast(message, "error", <AlertCircle className="w-4 h-4" />);
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, showCopyToast, showFavoriteToast, showExportToast, showErrorToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
              animate-in slide-in-from-right-5 fade-in duration-300
              ${toast.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" : ""}
              ${toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : ""}
              ${toast.type === "info" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : ""}
              ${toast.type === "warning" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : ""}
            `}
          >
            {toast.icon || (
              toast.type === "success" ? <Check className="w-4 h-4" /> :
              toast.type === "error" ? <AlertCircle className="w-4 h-4" /> :
              toast.type === "info" ? <Info className="w-4 h-4" /> :
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
