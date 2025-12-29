"use client";

import { useState } from "react";
import { X, CreditCard, Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

/**
 * Banner de anuncio para informar sobre disponibilidad de Mercado Pago
 * Se muestra solo a usuarios de países LATAM
 */
export function MercadoPagoAnnouncement() {
  const { t, language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(() => {
    // Verificar si el usuario ya cerró el banner
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mp-announcement-dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('mp-announcement-dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Contenido */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-white/80" />
                <p className="text-white font-semibold text-sm sm:text-base">
                  {language === 'es'
                    ? '¡Ahora aceptamos Mercado Pago! 🎉'
                    : 'We now accept Mercado Pago! 🎉'}
                </p>
              </div>
              <p className="text-white/90 text-xs sm:text-sm">
                {language === 'es'
                  ? 'Paga en tu moneda local (ARS, BRL, MXN, CLP y más). Disponible en toda Latinoamérica.'
                  : 'Pay in your local currency (ARS, BRL, MXN, CLP and more). Available across Latin America.'}
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label={language === 'es' ? 'Cerrar anuncio' : 'Close announcement'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
