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
      <footer className="border-t border-violet-500/20 bg-purple-950/60 backdrop-blur-xl shadow-lg shadow-violet-500/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AppIcon size="md" />
                <span className="text-white font-semibold text-base">{t.appName}</span>
              </div>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                {t.appSubtitle}
              </p>
            </div>

            {/* Links Producto */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">{t.product}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {t.pricing}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {t.faq}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Legales */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">{t.legal}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {t.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    {t.privacy}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Pro Upgrade */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm">{t.proSection}</h3>
              {user && !isPro ? (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-medium transition-colors"
                >
                  <Crown className="w-3 h-3" />
                  {t.upgradeToPROFooter}
                </button>
              ) : !user ? (
                <p className="text-gray-400 text-xs">
                  {t.signInToAccessPro}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-violet-400">
                  <Crown className="w-3 h-3" />
                  <span className="text-xs font-medium">{t.proActive}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">{t.copyright}</p>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">
                {t.poweredBy}
              </span>
            </div>
          </div>
        </div>
      </footer>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
