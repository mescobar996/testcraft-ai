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

  const closeModal = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeModal}
      />
      
      {/* Modal - Mobile: desde abajo, Desktop: centrado */}
      <div className="relative w-full sm:w-[95%] sm:max-w-xl h-auto max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-center flex-shrink-0">
          <button 
            type="button"
            onClick={closeModal}
            className="absolute top-3 right-3 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">TestCraft AI Pro</h2>
          <p className="text-violet-200 text-sm">Desbloqueá todo el potencial</p>
          
          <div className="mt-3 flex items-center justify-center gap-1">
            <span className="text-3xl font-bold text-white">$5</span>
            <span className="text-violet-200">/mes</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-3">
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

        {/* Footer con CTA */}
        <div className="p-5 border-t border-slate-800 flex-shrink-0">
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 text-white py-4 text-lg font-semibold rounded-xl transition-all"
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
          <p className="text-center text-slate-500 text-xs mt-3">
            Pago seguro con Stripe • Cancelá cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description, bgColor }: { icon: React.ReactNode; title: string; description: string; bgColor: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-slate-400 text-xs">{description}</p>
      </div>
    </div>
  );
}
