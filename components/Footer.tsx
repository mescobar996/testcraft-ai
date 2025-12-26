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
      <footer className="border-t border-zinc-800/50 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AppIcon size="md" />
                <span className="text-white font-semibold text-base">{t.appName}</span>
              </div>
              <p className="text-zinc-600 text-xs max-w-xs leading-relaxed">
                {t.appSubtitle}
              </p>
            </div>

            {/* Links Producto */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">Producto</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-zinc-600 hover:text-white text-xs transition-colors"
                  >
                    Precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-zinc-600 hover:text-white text-xs transition-colors"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Legales */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-zinc-600 hover:text-white text-xs transition-colors"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-zinc-600 hover:text-white text-xs transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pro Upgrade */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">Pro</h3>
              {user && !isPro ? (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-medium transition-colors"
                >
                  <Crown className="w-3 h-3" />
                  Actualizar a Pro
                </button>
              ) : !user ? (
                <p className="text-zinc-600 text-xs">
                  Inicia sesión para acceder a Pro
                </p>
              ) : (
                <div className="flex items-center gap-2 text-violet-400">
                  <Crown className="w-3 h-3" />
                  <span className="text-xs font-medium">Pro activo</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-zinc-800/50 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-sm">{t.copyright}</p>
            <div className="flex items-center gap-4">
              <span className="text-zinc-600 text-sm">
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
