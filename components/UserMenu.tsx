"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/UpgradeModal';
import {
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Crown,
  Infinity,
  Globe
} from 'lucide-react';

export function UserMenu() {
  const { user, loading, signInWithGoogle, signOut, usageCount, maxUsage, isPro } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // --- CORRECCIÓN DE HIDRATACIÓN ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no ha montado, mostramos un "esqueleto" redondo para evitar saltos
  if (!mounted) {
    return <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse" />;
  }
  // ---------------------------------

  if (loading) {
    return (
      <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button
        onClick={signInWithGoogle}
        variant="outline"
        size="sm"
        className="border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-white transition-all duration-300"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Iniciar sesión
      </Button>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 pr-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full transition-all duration-300"
        >
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              width={28}
              height={28}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )} 
          <span className="text-sm text-slate-300 hidden sm:block max-w-[100px] truncate">
            {user.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
          </span>
          {isPro && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.user_metadata?.full_name || 'Usuario'}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Uso diario
                  </span>
                  <span className="text-white text-sm font-medium">
                    {isPro ? (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Infinity className="w-4 h-4" />
                        Ilimitado
                      </span>
                    ) : (
                      `${usageCount} / ${maxUsage}`
                    )}
                  </span>
                </div>
                {!isPro && (
                  <>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${Math.min((usageCount / maxUsage) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {maxUsage - usageCount} generaciones restantes hoy
                    </p>
                  </>
                )}
              </div>

              {/* Plan Badge & Upgrade */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Plan actual</span>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                      <Crown className="w-3 h-3" />
                      Pro
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                      Gratuito
                    </span>
                  )}
                </div>
                {!isPro && (
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full mt-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                    size="sm"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Actualizar Plan
                  </Button>
                )}
              </div>

              {/* Language Selector */}
              <div className="p-4 border-b border-slate-700">
                <span className="text-slate-400 text-sm block mb-2">Idioma</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage("es")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      language === "es"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    🇪🇸 Español
                  </button>
                  <button
                    onClick={() => setLanguage("en")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      language === "en"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Sign Out */}
              <div className="p-2">
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </>
  );
}