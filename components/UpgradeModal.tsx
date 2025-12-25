"use client";

import { useState } from "react";
import { X, Check, Loader2, Crown, Zap, Shield, Clock, Sparkles, Camera, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!user) {
      setError("Para continuar con la compra, primero debes iniciar sesion con tu cuenta de Google usando el boton en la esquina superior derecha.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies de sesión
        body: JSON.stringify({
          planId: 'PRO',
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la sesion de pago');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('El sistema de pagos no esta disponible. Stripe no esta configurado en el servidor.');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar con el servidor de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:max-h-[80vh] bg-slate-900 sm:rounded-2xl sm:border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 p-5 sm:p-6 text-center flex-shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">TestCraft AI Pro</h2>
          <p className="text-violet-200 text-sm">Desbloquea todo el potencial</p>
          
          <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1">
            <span className="text-3xl sm:text-4xl font-bold text-white">$29</span>
            <span className="text-violet-200">/mes</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {!user && !error && (
            <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
              <LogIn className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium text-sm">Inicia sesion para continuar</p>
                <p className="text-blue-300/70 text-xs mt-1">Usa el boton de Google en la esquina superior derecha</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            <Feature 
              icon={<Zap className="w-5 h-5 text-green-400" />}
              title="Generaciones ilimitadas"
              description="Sin limites diarios"
              bgColor="bg-green-500/10"
            />
            <Feature 
              icon={<Camera className="w-5 h-5 text-fuchsia-400" />}
              title="Generacion desde imagen"
              description="Subi screenshots y generamos casos"
              bgColor="bg-fuchsia-500/10"
              isNew
            />
            <Feature 
              icon={<Clock className="w-5 h-5 text-blue-400" />}
              title="Prioridad en generacion"
              description="Respuestas mas rapidas"
              bgColor="bg-blue-500/10"
            />
            <Feature 
              icon={<Shield className="w-5 h-5 text-purple-400" />}
              title="Historial completo"
              description="Guarda todo para siempre"
              bgColor="bg-purple-500/10"
            />
            <Feature 
              icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
              title="Test Plan PDF profesional"
              description="Formato ejecutivo"
              bgColor="bg-yellow-500/10"
            />
            <Feature 
              icon={<Check className="w-5 h-5 text-pink-400" />}
              title="Soporte prioritario"
              description="Respuesta en 24hs"
              bgColor="bg-pink-500/10"
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 ${
              !user 
                ? 'bg-slate-700 hover:bg-slate-600' 
                : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
            } disabled:opacity-50 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all shadow-lg`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : !user ? (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar sesion para comprar
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Actualizar a Pro
              </>
            )}
          </button>
          <p className="text-center text-slate-500 text-xs sm:text-sm mt-3">
            Pago seguro con Stripe - Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description, bgColor, isNew }: { icon: React.ReactNode; title: string; description: string; bgColor: string; isNew?: boolean }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 relative">
      <div className={`w-10 h-10 sm:w-11 sm:h-11 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm sm:text-base">{title}</p>
          {isNew && (
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded text-[10px] font-bold text-white">
              NUEVO
            </span>
          )}
        </div>
        <p className="text-slate-400 text-xs sm:text-sm">{description}</p>
      </div>
    </div>
  );
}
