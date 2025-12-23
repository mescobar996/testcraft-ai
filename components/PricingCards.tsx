"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { PLANS, PlanId } from "@/lib/stripe"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PricingCardsProps {
  userSubscription?: {
    tier: string
    status: string
  }
}

export function PricingCards({ userSubscription }: PricingCardsProps) {
  const [isLoading, setIsLoading] = useState<PlanId | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubscribe = async (planId: PlanId) => {
    // No permitir elegir plan FREE si ya está en FREE
    if (planId === 'FREE' && userSubscription?.tier === 'FREE') {
      return
    }

    // No permitir elegir el mismo plan
    if (planId === userSubscription?.tier?.toUpperCase() && userSubscription?.status === 'active') {
      return
    }

    setIsLoading(planId)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login?redirect=/pricing')
        return
      }

      if (planId === 'FREE') {
        // Downgrade a FREE
        const response = await fetch('/api/stripe/subscription', {
          method: 'DELETE',
        })

        if (response.ok) {
          router.refresh()
        }
        return
      }

      // Crear sesión de checkout - el servidor validará el plan
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se pudo crear la sesión de checkout')
      }

    } catch (error) {
      console.error("Subscribe error:", error)
      alert("Error al procesar la suscripción. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {Object.entries(PLANS).map(([planId, plan]) => {
        const isCurrentPlan = userSubscription?.tier?.toUpperCase() === planId
        const isActive = userSubscription?.status === 'active'
        const isLoadingThisPlan = isLoading === planId

        return (
          <div
            key={planId}
            className={`relative rounded-2xl border p-8 ${
              planId === 'PRO'
                ? 'border-violet-500 bg-slate-900/50 shadow-2xl shadow-violet-500/10'
                : 'border-slate-700 bg-slate-900/50'
            }`}
          >
            {planId === 'PRO' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-slate-400">/mes</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(planId as PlanId)}
              disabled={isLoadingThisPlan || (isCurrentPlan && isActive)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isCurrentPlan && isActive
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : planId === 'PRO'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {isLoadingThisPlan ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </div>
              ) : isCurrentPlan && isActive ? (
                'Plan Actual'
              ) : planId === 'FREE' && userSubscription?.tier === 'FREE' ? (
                'Plan Actual'
              ) : (
                plan.price === 0 ? 'Plan Gratis' : 'Elegir Plan'
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}