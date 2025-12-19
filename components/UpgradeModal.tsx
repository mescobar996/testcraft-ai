"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Loader2, Crown, Zap, Shield, Clock, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay de fondo */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-center">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">TestCraft AI Pro</h2>
          <p className="text-violet-200">Desbloqueá todo el potencial</p>
          
          <div className="mt-4 flex items-center justify-center gap-1">
            <span className="text-4xl font-bold text-white">$5</span>
            <span className="text-violet-200">/mes</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <div className="space-y-4">
            <Feature 
              icon={<Zap className="w-5 h-5 text-green-400" />}
              title="Generaciones ilimitadas"
              description="Sin límites diarios"
              color="green"
            />
            <Feature 
              icon={<Clock className="w-5 h-5 text-blue-400" />}
              title="Prioridad en generación"
              description="Respuestas más rápidas"
              color="blue"
            />
            <Feature 
              icon={<Shield className="w-5 h-5 text-purple-400" />}
              title="Historial completo"
              description="Guardá todo para siempre"
              color="purple"
            />
            <Feature 
              icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
              title="Generación desde imagen"
              description="Subí screenshots"
              color="yellow"
            />
            <Feature 
              icon={<Check className="w-5 h-5 text-pink-400" />}
              title="Test Plan PDF profesional"
              description="Formato ejecutivo"
              color="pink"
            />
          </div>
        </div>

        {/* Footer con CTA */}
        <div className="p-6 border-t border-slate-800 bg-slate-900">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg shadow-violet-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Actualizar a Pro
              </>
            )}
          </Button>
          <p className="text-center text-slate-500 text-sm mt-3">
            Pago seguro con Stripe • Cancelá cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const bgColors: Record<string, string> = {
    green: 'bg-green-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    yellow: 'bg-yellow-500/10',
    pink: 'bg-pink-500/10',
  };
  
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 ${bgColors[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}
