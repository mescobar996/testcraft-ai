import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { PricingCards } from "@/components/PricingCards"
import { CreditCard, Calendar, CheckCircle, XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Billing - TestCraft AI",
  description: "Gestiona tu suscripción y plan de TestCraft AI",
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login?redirect=/billing')
  }

  // Obtener información de suscripción
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, usage_count, created_at')
    .eq('id', session.user.id)
    .single()

  const subscription = {
    tier: userData?.subscription_tier || 'free',
    status: userData?.subscription_status || 'active',
    usage: userData?.usage_count || 0,
    createdAt: userData?.created_at || new Date().toISOString(),
  }

  const showSuccess = searchParams.success === 'true'
  const showCanceled = searchParams.canceled === 'true'

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Gestión de Suscripción</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Administra tu plan de TestCraft AI y mantén el control de tu suscripción.
          </p>
        </div>

        {/* Mensajes de estado */}
        {showSuccess && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">
                ¡Suscripción actualizada exitosamente! Bienvenido a tu nuevo plan.
              </p>
            </div>
          </div>
        )}

        {showCanceled && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-400">
                El proceso de suscripción fue cancelado. Puedes intentar de nuevo cuando quieras.
              </p>
            </div>
          </div>
        )}

        {/* Información actual de suscripción */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Tu Suscripción Actual</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">Plan</h3>
              </div>
              <p className="text-2xl font-bold text-white capitalize">
                {subscription.tier}
              </p>
              <p className="text-sm text-slate-400">
                Estado: <span className="capitalize">{subscription.status}</span>
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">Uso</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {subscription.usage}
              </p>
              <p className="text-sm text-slate-400">
                casos de prueba generados
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-semibold text-white">Miembro desde</h3>
              </div>
              <p className="text-lg font-bold text-white">
                {new Date(subscription.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Planes disponibles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Cambiar de Plan
          </h2>
          <PricingCards userSubscription={subscription} />
        </div>

        {/* FAQ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Preguntas Frecuentes</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-slate-400">
                Sí, puedes actualizar o cancelar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Qué pasa si cancelo mi suscripción Pro?
              </h3>
              <p className="text-slate-400">
                Tu plan se mantendrá activo hasta el final del período de facturación actual, luego se cambiará automáticamente al plan Gratis.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Los casos de prueba generados se mantienen si cambio de plan?
              </h3>
              <p className="text-slate-400">
                Sí, todos tus casos de prueba e historial se mantienen. Si bajas de plan, podrás acceder a ellos pero no generar nuevos hasta el límite de tu plan actual.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Aceptan pagos con tarjeta de crédito?
              </h3>
              <p className="text-slate-400">
                Sí, aceptamos todas las principales tarjetas de crédito y débito a través de Stripe, nuestra pasarela de pago segura.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            ¿Necesitas ayuda?{" "}
            <Link href="/contact" className="text-violet-400 hover:text-violet-300">
              Contáctanos
            </Link>
            {" "}o envía un email a{" "}
            <a href="mailto:support@testcraft-ai.com" className="text-violet-400 hover:text-violet-300">
              testcraftia@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}