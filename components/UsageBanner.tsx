"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Zap, LogIn, AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/UpgradeModal';

export function UsageBanner() {
  const { user, usageCount, maxUsage, canGenerate, isPro, signInWithGoogle } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Pro users don't see any banner
  if (isPro) {
    return null;
  }

  // Don't show if user has plenty of usage left
  if (canGenerate && usageCount < maxUsage - 2) {
    return null;
  }

  // Show warning when running low
  if (canGenerate && usageCount >= maxUsage - 2) {
    return (
      <>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>
                Te quedan {maxUsage - usageCount} generaciones hoy.
              </span>
            </div>
            {user ? (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
              >
                <Crown className="w-4 h-4 mr-1" />
                Actualizar a Pro
              </Button>
            ) : (
              <Button
                onClick={signInWithGoogle}
                size="sm"
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Iniciar sesión para más
              </Button>
            )}
          </div>
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </>
    );
  }

  // Show limit reached
  return (
    <>
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-white font-medium">Límite diario alcanzado</p>
            <p className="text-slate-400 text-sm mt-1">
              {user 
                ? "Actualizá a Pro para generaciones ilimitadas."
                : "Iniciá sesión para obtener más generaciones diarias."
              }
            </p>
          </div>
          {user ? (
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            >
              <Crown className="w-4 h-4 mr-2" />
              Actualizar a Pro - $5/mes
            </Button>
          ) : (
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
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}
