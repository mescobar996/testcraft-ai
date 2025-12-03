"use client";

import { useAuth } from '@/lib/auth-context';
import { Zap, LogIn, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UsageBanner() {
  const { user, usageCount, maxUsage, canGenerate, signInWithGoogle } = useAuth();

  // Don't show if user has plenty of usage left
  if (canGenerate && usageCount < maxUsage - 2) {
    return null;
  }

  // Show warning when running low
  if (canGenerate && usageCount >= maxUsage - 2) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>
            Te quedan {maxUsage - usageCount} generaciones hoy.
            {!user && (
              <button 
                onClick={signInWithGoogle}
                className="underline ml-1 hover:text-yellow-300"
              >
                Iniciá sesión para obtener más.
              </button>
            )}
          </span>
        </div>
      </div>
    );
  }

  // Show limit reached
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="text-white font-medium">Límite diario alcanzado</p>
          <p className="text-slate-400 text-sm mt-1">
            {user 
              ? "Volvé mañana o actualizá a Premium para generaciones ilimitadas."
              : "Iniciá sesión para obtener más generaciones diarias."
            }
          </p>
        </div>
        {!user && (
          <Button
            onClick={signInWithGoogle}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Iniciar sesión con Google
          </Button>
        )}
      </div>
    </div>
  );
}
