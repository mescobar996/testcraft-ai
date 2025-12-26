"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { getReferralData, getReferralUrl, type ReferralData } from "@/lib/referral";
import { Share2, Copy, Check, Gift, Users } from "lucide-react";
import { useToast } from "@/components/Toast";

export function ReferralPanel() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      const data = getReferralData(user.id);
      setReferralData(data);
    }
  }, [user]);

  if (!user || !referralData) return null;

  const referralUrl = getReferralUrl(referralData.referralCode);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    showToast(
      language === "es" ? "Link de referido copiado al portapapeles" : "Referral link copied to clipboard",
      "success"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: 'twitter' | 'whatsapp' | 'email') => {
    const text = language === "es"
      ? `¡Prueba TestCraft AI! Genera casos de prueba con IA en segundos. Usa mi link: ${referralUrl}`
      : `Try TestCraft AI! Generate test cases with AI in seconds. Use my link: ${referralUrl}`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      email: `mailto:?subject=TestCraft AI&body=${encodeURIComponent(text)}`
    };

    window.open(urls[platform], '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-violet-500/30 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
          <Gift className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            {language === "es" ? "Programa de Referidos" : "Referral Program"}
          </h3>
          <p className="text-sm text-slate-400">
            {language === "es" ? "Invita amigos y gana generaciones bonus" : "Invite friends and earn bonus generations"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-violet-400" />
            <span className="text-2xl font-bold text-white">{referralData.totalReferrals}</span>
          </div>
          <p className="text-xs text-slate-400">
            {language === "es" ? "Referidos" : "Referrals"}
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-green-400">+{referralData.bonusEarned}</span>
          </div>
          <p className="text-xs text-slate-400">
            {language === "es" ? "Bonus ganados" : "Bonus earned"}
          </p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {language === "es" ? "Tu link de referido" : "Your referral link"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (language === "es" ? "¡Copiado!" : "Copied!") : (language === "es" ? "Copiar" : "Copy")}
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => shareVia('twitter')}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-colors text-sm"
        >
          Twitter
        </button>
        <button
          onClick={() => shareVia('whatsapp')}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-colors text-sm"
        >
          WhatsApp
        </button>
        <button
          onClick={() => shareVia('email')}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg transition-colors text-sm"
        >
          Email
        </button>
      </div>

      {/* Info */}
      <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
        <p className="text-xs text-violet-300">
          {language === "es"
            ? "🎁 Ganas +5 generaciones por cada amigo que se registre con tu link"
            : "🎁 Earn +5 generations for each friend who signs up with your link"}
        </p>
      </div>
    </div>
  );
}
