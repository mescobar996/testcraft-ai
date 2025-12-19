"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Loader2, Crown, Zap, Shield, Clock } from "lucide-react";
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
    <div className="fixed inset-0 z-[100] bg-white/10 backdrop-blur-md">
      {/* Header fijo */}
      <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700 z-10">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Actualizar a Pro</h2>
              <p className="text-sm text-slate-400">Desbloqueá todo el potencial</p>
            </div>
          </div>
          <Button 
            onClick={onClose} 
            variant="outline"
            size="sm"
            className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>

      {/* Contenido */}
      <div className="overflow-y-auto p-4 max-w-2xl mx-auto" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Banner */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">TestCraft AI Pro</h3>
          <p className="text-violet-200 text-lg mb-6">Generá casos de prueba sin límites</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-bold text-white">$5</span>
            <span className="text-violet-200 text-xl">/mes</span>
          </div>
        </div>

        {/* Features */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-6 mb-8">
          <h4 className="text-white font-semibold mb-4 text-lg">Todo incluido:</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Generaciones ilimitadas</p>
                <p className="text-slate-400 text-sm">Sin límites diarios, generá todos los casos que necesites</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Prioridad en generación</p>
                <p className="text-slate-400 text-sm">Respuestas más rápidas en horas pico</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Historial completo</p>
                <p className="text-slate-400 text-sm">Guardá todos tus casos generados para siempre</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">Generación desde imagen</p>
                <p className="text-slate-400 text-sm">Subí screenshots y generá casos automáticamente</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-white font-medium">Test Plan PDF profesional</p>
                <p className="text-slate-400 text-sm">Exportá planes de prueba con formato ejecutivo</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl"
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

          <p className="text-center text-slate-500 text-sm">
            Pago seguro con Stripe • Cancelá cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}
