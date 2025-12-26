"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to analytics/monitoring service
    console.error("ErrorBoundary caught:", error, errorInfo);

    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === "production") {
      // Ejemplo: Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Algo salió mal
            </h1>

            <p className="text-slate-400 mb-6">
              Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar de nuevo
              </Button>

              <Button
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="border-slate-700"
              >
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para componentes funcionales
export function useErrorHandler() {
  const handleError = (error: Error) => {
    console.error("Error capturado:", error);

    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === "production") {
      // Ejemplo: Sentry.captureException(error);
    }
  };

  return { handleError };
}
