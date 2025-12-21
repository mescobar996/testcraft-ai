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
      <footer className="border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AppIcon size="md" />
                <span className="text-white font-bold text-lg">{t.appName}</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs">
                {t.appSubtitle}
              </p>
            </div>

            {/* Links Legales */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/terms" 
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Política de Privacidad
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
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Actualizar a Pro
                </button>
              ) : !user ? (
                <p className="text-slate-400 text-sm">
                  Iniciá sesión para acceder a Pro
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
