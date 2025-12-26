"use client";

import { BarChart3 } from "lucide-react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export function AnalyticsSection() {
  return (
    <section id="analytics" className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-violet-400" />
        <h2 className="text-2xl font-bold text-white">Analytics Personales</h2>
      </div>

      <AnalyticsDashboard />
    </section>
  );
}
