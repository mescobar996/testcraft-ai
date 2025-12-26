"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import {
  getUserAnalytics,
  calculateTimeSaved,
  calculateGrowth,
  getMostUsedFeature,
  type UserAnalytics
} from "@/lib/analytics";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Star,
  Download,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const userId = user?.id || null;
    const data = getUserAnalytics(userId);
    setAnalytics(data);
  }, [user, mounted]);

  if (!mounted || !analytics) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-slate-800/50 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-800/50 rounded-lg"></div>
          <div className="h-24 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const timeSaved = calculateTimeSaved(analytics.totalGenerations);
  const growth = calculateGrowth(analytics.generationsThisMonth, analytics.generationsLastMonth);
  const mostUsed = getMostUsedFeature(analytics);

  const getGrowthIcon = () => {
    switch (growth.trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getGrowthColor = () => {
    switch (growth.trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {language === "es" ? "Tu Dashboard Personal" : "Your Personal Dashboard"}
          </h2>
          <p className="text-sm text-slate-400">
            {language === "es"
              ? "Métricas y estadísticas de tu uso"
              : "Your usage metrics and statistics"}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Generaciones este mes */}
        <StatCard
          icon={<Zap className="w-5 h-5 text-violet-400" />}
          label={language === "es" ? "Este Mes" : "This Month"}
          value={analytics.generationsThisMonth}
          suffix={language === "es" ? "generaciones" : "generations"}
          trend={growth}
          trendIcon={getGrowthIcon()}
          trendColor={getGrowthColor()}
        />

        {/* Tiempo ahorrado */}
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          label={language === "es" ? "Tiempo Ahorrado" : "Time Saved"}
          value={timeSaved}
          suffix={language === "es" ? "horas" : "hours"}
          highlight
        />

        {/* Racha actual */}
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label={language === "es" ? "Racha Actual" : "Current Streak"}
          value={analytics.currentStreak}
          suffix={language === "es" ? "días" : "days"}
          sublabel={
            analytics.longestStreak > analytics.currentStreak
              ? `${language === "es" ? "Máx" : "Max"}: ${analytics.longestStreak}`
              : undefined
          }
        />

        {/* Total generaciones */}
        <StatCard
          icon={<Star className="w-5 h-5 text-yellow-400" />}
          label={language === "es" ? "Total" : "Total"}
          value={analytics.totalGenerations}
          suffix={language === "es" ? "casos creados" : "cases created"}
        />
      </div>

      {/* Features más usadas */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          {language === "es" ? "Features Más Utilizadas" : "Most Used Features"}
        </h3>

        <div className="space-y-3">
          {/* Feature principal */}
          {mostUsed && (
            <div className="flex items-center justify-between p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-sm font-medium text-white">
                  {language === "es" ? mostUsed.name : mostUsed.nameEn}
                </span>
              </div>
              <span className="text-sm font-semibold text-violet-400">
                {mostUsed.count} {language === "es" ? "veces" : "times"}
              </span>
            </div>
          )}

          {/* Otras stats */}
          <div className="grid grid-cols-2 gap-3">
            <FeatureStat
              label={language === "es" ? "Exportaciones" : "Exports"}
              value={analytics.exportCount}
              icon={<Download className="w-3 h-3" />}
            />
            <FeatureStat
              label={language === "es" ? "Favoritos" : "Favorites"}
              value={analytics.favoriteCount}
              icon={<Star className="w-3 h-3" />}
            />
          </div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      {analytics.totalGenerations > 0 && (
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-lg p-4">
          <p className="text-sm text-white">
            {language === "es" ? (
              <>
                💡 <strong>¡Increíble!</strong> Has generado {analytics.totalGenerations} casos de prueba,
                ahorrándote aproximadamente <strong>{timeSaved} horas</strong> de trabajo manual.
                {analytics.totalGenerations >= 8 && " ¡Considera actualizar a Pro para casos ilimitados!"}
              </>
            ) : (
              <>
                💡 <strong>Amazing!</strong> You&apos;ve generated {analytics.totalGenerations} test cases,
                saving you approximately <strong>{timeSaved} hours</strong> of manual work.
                {analytics.totalGenerations >= 8 && " Consider upgrading to Pro for unlimited cases!"}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  trend?: { percentage: number; trend: 'up' | 'down' | 'stable' };
  trendIcon?: React.ReactNode;
  trendColor?: string;
  highlight?: boolean;
  sublabel?: string;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  trend,
  trendIcon,
  trendColor,
  highlight,
  sublabel
}: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      highlight
        ? 'bg-violet-500/10 border-violet-500/30'
        : 'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-slate-900/50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        {trend && trendIcon && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            {trendIcon}
            <span>{trend.percentage}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">
          {value.toLocaleString()}
        </div>
        <div className="text-xs text-slate-400">
          {suffix}
        </div>
        {sublabel && (
          <div className="text-xs text-slate-500 mt-1">
            {sublabel}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-2">
        {label}
      </div>
    </div>
  );
}

interface FeatureStatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function FeatureStat({ label, value, icon }: FeatureStatProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
      <div className="flex items-center gap-2">
        <div className="text-slate-400">{icon}</div>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}
