"use client";

import Link from "next/link";
import { AppIcon } from "@/components/AppIcon";
import { useLanguage } from "@/lib/language-context";
import { Crown } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/lib/auth-context";

export function Footer() {
  const { t } = useLanguage();
  const { user, isPro } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 group">
                <div className="transition-transform duration-300 group-hover:scale-110">
                  <AppIcon size="md" />
                </div>
                <span className="text-white font-bold text-lg group-hover:text-violet-300 transition-colors">{t.appName}</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs">
                {t.appSubtitle}
              </p>
            </div>

            {/* Links Producto - MOVIDO ARRIBA */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-400 hover:text-violet-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-slate-400 hover:text-violet-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Preguntas Frecuentes (FAQ)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Legales */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-400 hover:text-violet-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-slate-400 hover:text-violet-400 text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Politica de Privacidad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pro Upgrade */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Pro</h3>
              {user && !isPro ? (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-violet-500/50 hover:scale-105"
                >
                  <Crown className="w-4 h-4" />
                  Actualizar a Pro
                </button>
              ) : !user ? (
                <p className="text-slate-400 text-sm">
                  Inicia sesion para acceder a Pro
                </p>
              ) : (
                <div className="flex items-center gap-2 text-violet-400">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Pro activo</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">{t.copyright}</p>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 text-xs">
                Powered by Claude AI
              </span>
            </div>
          </div>
        </div>
      </footer>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
