"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient } from "@/lib/supabase";
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";

export function DiagnosticPanel() {
  const { user } = useAuth();
  const [checks, setChecks] = useState({
    supabase: { status: "checking", message: "" },
    auth: { status: "checking", message: "" },
    database: { status: "checking", message: "" },
  });

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const runDiagnostics = async () => {
    // Check 1: Supabase Client
    const supabase = getSupabaseClient();
    if (supabase) {
      setChecks(prev => ({
        ...prev,
        supabase: { status: "success", message: "Cliente de Supabase inicializado" }
      }));
    } else {
      setChecks(prev => ({
        ...prev,
        supabase: { status: "error", message: "Variables de entorno faltantes" }
      }));
      return;
    }

    // Check 2: Autenticación
    if (user) {
      setChecks(prev => ({
        ...prev,
        auth: { status: "success", message: `Usuario autenticado: ${user.email}` }
      }));

      // Check 3: Base de datos (intentar leer tabla)
      try {
        const { data, error } = await supabase
          .from('generations')
          .select('id')
          .limit(1);

        if (error) {
          setChecks(prev => ({
            ...prev,
            database: {
              status: "error",
              message: `Error de BD: ${error.message}`
            }
          }));
        } else {
          setChecks(prev => ({
            ...prev,
            database: {
              status: "success",
              message: "Conexión a BD exitosa"
            }
          }));
        }
      } catch (err) {
        setChecks(prev => ({
          ...prev,
          database: {
            status: "error",
            message: `Error: ${err instanceof Error ? err.message : 'Desconocido'}`
          }
        }));
      }
    } else {
      setChecks(prev => ({
        ...prev,
        auth: { status: "warning", message: "No hay usuario autenticado" },
        database: { status: "warning", message: "Requiere autenticación" }
      }));
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case "checking":
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl max-w-sm z-50">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Diagnóstico del Sistema
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {getIcon(checks.supabase.status)}
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Supabase</p>
            <p className="text-slate-400 text-xs">{checks.supabase.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getIcon(checks.auth.status)}
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Autenticación</p>
            <p className="text-slate-400 text-xs">{checks.auth.message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getIcon(checks.database.status)}
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Base de Datos</p>
            <p className="text-slate-400 text-xs">{checks.database.message}</p>
          </div>
        </div>
      </div>

      <button
        onClick={runDiagnostics}
        className="w-full mt-3 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors"
      >
        Volver a verificar
      </button>
    </div>
  );
}
