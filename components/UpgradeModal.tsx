"use client";

import { useState } from "react";
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
    <div 
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
    >
      {/* OVERLAY - Fondo blanco semi-transparente */}
      <div 
        className="fixed inset-0 bg-white/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* MODAL */}
      {/* Mobile: pantalla completa | Desktop: centrado con max-width */}
      <div className="fixed inset-0 md:inset-auto md:top-[10%] md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg md:max-h-[80vh] bg-slate-900 md:rounded-2xl border-0 md:border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER con gradiente */}
        <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 p-6 md:p-8 text-center">
          {/* BOTÓN CERRAR */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
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

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="space-y-4">
            <Feature 
              icon={<Zap className="w-5 h-5 text-green-400" />}
              title="Generaciones ilimitadas"
              description="Sin límites diarios"
              bgColor="bg-green-500/10"
            />
            <Feature 
              icon={<Clock className="w-5 h-5 text-blue-400" />}
              title="Prioridad en generación"
              description="Respuestas más rápidas"
              bgColor="bg-blue-500/10"
            />
            <Feature 
              icon={<Shield className="w-5 h-5 text-purple-400" />}
              title="Historial completo"
              description="Guardá todo para siempre"
              bgColor="bg-purple-500/10"
            />
            <Feature 
              icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
              title="Generación desde imagen"
              description="Subí screenshots"
              bgColor="bg-yellow-500/10"
            />
            <Feature 
              icon={<Check className="w-5 h-5 text-pink-400" />}
              title="Test Plan PDF profesional"
              description="Formato ejecutivo"
              bgColor="bg-pink-500/10"
            />
          </div>
        </div>

        {/* FOOTER con CTA */}
        <div className="p-5 md:p-6 border-t border-slate-800">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white py-4 text-lg font-semibold rounded-xl transition-all shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Actualizar a Pro
              </>
            )}
          </button>
          <p className="text-center text-slate-500 text-sm mt-3">
            Pago seguro con Stripe • Cancelá cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description, bgColor }: { icon: React.ReactNode; title: string; description: string; bgColor: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}
