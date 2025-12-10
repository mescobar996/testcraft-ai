"use client";

import { TestCase } from "@/app/page";
import { CheckCircle2, XCircle, AlertTriangle, BarChart3 } from "lucide-react";

interface StatsCardsProps {
  testCases: TestCase[];
}

export function StatsCards({ testCases }: StatsCardsProps) {
  const stats = {
    total: testCases.length,
    positive: testCases.filter(tc => tc.type === "Positivo").length,
    negative: testCases.filter(tc => tc.type === "Negativo").length,
    edge: testCases.filter(tc => tc.type === "Borde").length,
    highPriority: testCases.filter(tc => tc.priority === "Alta").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <StatCard
        icon={<BarChart3 className="w-4 h-4" />}
        label="Total"
        value={stats.total}
        color="violet"
      />
      <StatCard
        icon={<CheckCircle2 className="w-4 h-4" />}
        label="Positivos"
        value={stats.positive}
        color="green"
      />
      <StatCard
        icon={<XCircle className="w-4 h-4" />}
        label="Negativos"
        value={stats.negative}
        color="red"
      />
      <StatCard
        icon={<AlertTriangle className="w-4 h-4" />}
        label="Borde"
        value={stats.edge}
        color="yellow"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "violet" | "green" | "red" | "yellow";
}

const colorClasses = {
  violet: "from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-400",
  green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
  red: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
  yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400",
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`
      bg-gradient-to-br ${colorClasses[color]} 
      border rounded-lg p-3 
      transition-all duration-300 hover:scale-105
    `}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
