"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Zap, Crown, Building2, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfecto para probar la herramienta",
    icon: Zap,
    color: "from-slate-500 to-slate-600",
    features: [
      { text: "20 generaciones por día", included: true },
      { text: "Exportación Excel, PDF, JSON", included: true },
      { text: "Formatos Jira, TestRail, Zephyr", included: true },
      { text: "Historial 7 días", included: true },
      { text: "Generación desde imagen", included: false },
      { text: "Test Plan PDF profesional", included: false },
      { text: "Historial ilimitado", included: false },
      { text: "Soporte prioritario", included: false },
    ],
    cta: "Empezar Gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: "9",
    description: "Para profesionales de QA",
    icon: Crown,
    color: "from-violet-500 to-purple-600",
    features: [
      { text: "Generaciones ilimitadas", included: true },
      { text: "Exportación Excel, PDF, JSON", included: true },
      { text: "Formatos Jira, TestRail, Zephyr", included: true },
      { text: "Historial ilimitado", included: true },
      { text: "Generación desde imagen", included: true },
      { text: "Test Plan PDF profesional", included: true },
      { text: "Favoritos ilimitados", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    cta: "Comenzar Prueba Gratis",
    popular: true,
  },
  {
    name: "Team",
    price: "29",
    description: "Para equipos de testing",
    icon: Building2,
    color: "from-blue-500 to-cyan-600",
    features: [
      { text: "Todo de Pro incluido", included: true },
      { text: "5 usuarios incluidos", included: true },
      { text: "Workspace compartido", included: true },
      { text: "Historial del equipo", included: true },
      { text: "Administración de usuarios", included: true },
      { text: "Integraciones avanzadas", included: true },
      { text: "API access", included: true },
      { text: "Soporte dedicado", included: true },
    ],
    cta: "Contactar Ventas",
    popular: false,
    comingSoon: true,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (basePrice: string) => {
    if (basePrice === "0") return "0";
    const price = parseInt(basePrice);
    return billing === "yearly" ? Math.round(price * 0.8).toString() : basePrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a TestCraft</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Planes y Precios</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Elegí el plan que mejor se adapte a tus necesidades. Comenzá gratis y actualizá cuando quieras.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${billing === "monthly" ? "text-white" : "text-slate-500"}`}>Mensual</span>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className={`relative w-14 h-7 rounded-full transition-colors ${billing === "yearly" ? "bg-violet-600" : "bg-slate-700"}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${billing === "yearly" ? "translate-x-8" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm ${billing === "yearly" ? "text-white" : "text-slate-500"}`}>
            Anual <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">-20%</span>
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-slate-900/50 border rounded-2xl p-6 ${plan.popular ? "border-violet-500 ring-2 ring-violet-500/20" : "border-slate-800"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Más Popular
                  </span>
                </div>
              )}
              {plan.comingSoon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">Próximamente</span>
                </div>
              )}
              <div className="text-center mb-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-white">${getPrice(plan.price)}</span>
                {plan.price !== "0" && <span className="text-slate-400 ml-1">/mes</span>}
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />}
                    <span className={feature.included ? "text-slate-300" : "text-slate-600"}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.popular ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700" : plan.comingSoon ? "bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700"}`} disabled={plan.comingSoon}>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
              <h3 className="text-white font-medium mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-slate-400 text-sm">Sí, podés actualizar o cancelar tu plan cuando quieras.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
              <h3 className="text-white font-medium mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-slate-400 text-sm">Aceptamos todas las tarjetas de crédito y débito principales a través de Stripe.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
              <h3 className="text-white font-medium mb-2">¿Hay período de prueba?</h3>
              <p className="text-slate-400 text-sm">El plan Free es completamente funcional y no tiene límite de tiempo.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-4">¿Tenés preguntas? Escribinos a</p>
          <a href="mailto:mescobar996@gmail.com" className="text-violet-400 hover:text-violet-300">mescobar996@gmail.com</a>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2024 TestCraft AI. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">Términos</Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
