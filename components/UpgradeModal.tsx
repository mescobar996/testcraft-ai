"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  X,
  Check,
  Crown,
  Zap,
  Infinity,
  Shield,
  Loader2,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Error creating checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 text-center border-b border-slate-800">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/25">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Actualizá a Pro
            </h2>
            <p className="text-slate-400">
              Desbloqueá todo el potencial de TestCraft AI
            </p>
          </div>

          {/* Pricing */}
          <div className="p-6 border-b border-slate-800">
            <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-6 text-center">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-slate-400">USD/mes</span>
              </div>
              <p className="text-sm text-slate-400">
                Cancelá cuando quieras
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              Incluye
            </h3>
            <ul className="space-y-3">
              <FeatureItem
                icon={<Infinity className="w-5 h-5 text-violet-400" />}
                title="Generaciones ilimitadas"
                description="Sin límites diarios"
              />
              <FeatureItem
                icon={<Zap className="w-5 h-5 text-yellow-400" />}
                title="Prioridad en generación"
                description="Respuestas más rápidas"
              />
              <FeatureItem
                icon={<Shield className="w-5 h-5 text-green-400" />}
                title="Historial completo"
                description="Guardá todos tus casos generados"
              />
            </ul>
          </div>

          {/* CTA */}
          <div className="p-6 bg-slate-800/50">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-6 text-lg"
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
            <p className="text-xs text-slate-500 text-center mt-3">
              Pago seguro con Stripe • Cancelá cuando quieras
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </li>
  );
}
