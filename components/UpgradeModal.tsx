"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Zap, Check, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        alert('Error al iniciar el proceso de pago. Por favor intentá de nuevo.');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Error al conectar con el servidor de pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden">
        {/* Botón X fijo en esquina superior derecha */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-10 text-slate-400 hover:text-white p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header con gradiente */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-6 pr-14">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Actualizá a Pro</h2>
          <p className="text-violet-200">Desbloqueá todo el potencial de TestCraft AI</p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-4">INCLUYE</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Generaciones ilimitadas</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Prioridad en generación</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Historial completo</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Generación desde imagen</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span>Test Plan PDF profesional</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-6 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Actualizar a Pro - $5/mes
              </>
            )}
          </Button>

          <p className="text-center text-slate-500 text-sm mt-4">
            Pago seguro con Stripe • Cancelá cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}
