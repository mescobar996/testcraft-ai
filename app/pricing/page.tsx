import { Metadata } from "next"
import Link from "next/link"
import { PricingCards } from "@/components/PricingCards"
import { Check, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Precios - TestCraft AI",
  description: "Elige el plan perfecto para generar casos de prueba profesionales con IA.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <header className="border-b border-violet-500/20 bg-purple-950/60 backdrop-blur-xl sticky top-0 z-50 mb-12 -mx-4 px-4 shadow-lg shadow-violet-500/10">
        <div className="max-w-6xl mx-auto py-4">
          <Link href="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a TestCraft AI</span>
          </Link>
        </div>
      </header>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Planes que se adaptan a ti
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Desde proyectos personales hasta empresas grandes, tenemos el plan perfecto para 
            optimizar tu proceso de testing con IA.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-20">
          <PricingCards />
        </div>

        {/* Comparación detallada */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compara todas las características
          </h2>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-6 text-white font-semibold">Característica</th>
                    <th className="text-center p-6 text-white font-semibold">Gratis</th>
                    <th className="text-center p-6 text-violet-400 font-semibold">Pro</th>
                    <th className="text-center p-6 text-fuchsia-400 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Casos de prueba por mes', values: ['10', '500', 'Ilimitado'] },
                    { feature: 'Exportación a Excel', values: ['✓', '✓', '✓'] },
                    { feature: 'Exportación a PDF', values: ['✓', '✓', '✓'] },
                    { feature: 'Formato Gherkin', values: ['—', '✓', '✓'] },
                    { feature: 'Plantillas predefinidas', values: ['✓', '✓', '✓'] },
                    { feature: 'Plantillas personalizadas', values: ['—', '✓', '✓'] },
                    { feature: 'Historial completo', values: ['7 días', '✓', '✓'] },
                    { feature: 'Generación desde imagen', values: ['✓', '✓', '✓'] },
                    { feature: 'Integración Jira', values: ['—', '✓', '✓'] },
                    { feature: 'Integración TestRail', values: ['—', '—', '✓'] },
                    { feature: 'API pública', values: ['—', '—', '✓'] },
                    { feature: 'Soporte por email', values: ['✓', '✓', '✓'] },
                    { feature: 'Soporte prioritario', values: ['—', '✓', '✓'] },
                    { feature: 'Soporte 24/7', values: ['—', '—', '✓'] },
                    { feature: 'SLA garantizado', values: ['—', '—', '✓'] },
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-slate-800">
                      <td className="p-6 text-slate-300 font-medium">{row.feature}</td>
                      {row.values.map((value, i) => (
                        <td key={i} className="p-6 text-center">
                          {value === '✓' ? (
                            <Check className="w-5 h-5 text-green-400 mx-auto" />
                          ) : value === '—' ? (
                            <span className="text-slate-600">—</span>
                          ) : (
                            <span className="text-slate-300">{value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Preguntas Frecuentes
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-slate-400">
                Sí, absolutamente. Puedes actualizar, bajar o cancelar tu plan en cualquier momento. 
                Los cambios se aplican inmediatamente y los cargos se prorratean automáticamente.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-slate-400">
                Aceptamos todas las principales tarjetas de crédito y débito (Visa, Mastercard, American Express)
                a través de Stripe, nuestra pasarela de pago segura y certificada PCI DSS.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Puedo cancelar mi suscripción Pro?
              </h3>
              <p className="text-slate-400">
                Sí, puedes cancelar en cualquier momento desde tu panel de billing. Tu plan se mantendrá activo 
                hasta el final del período de facturación actual, luego se cambiará automáticamente al plan Gratis.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Los casos de prueba generados se mantienen si cambio de plan?
              </h3>
              <p className="text-slate-400">
                Absolutamente. Todos tus casos de prueba, historial y plantillas se mantienen sin importar el plan. 
                Si bajas de plan, podrás acceder a todo tu trabajo existente, pero los límites de generación 
                nuevos aplicarán según tu plan actual.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ¿Ofrecen descuentos para equipos o empresas?
              </h3>
              <p className="text-slate-400">
                Sí, ofrecemos descuentos especiales para equipos de 5+ usuarios y empresas. 
                Contáctanos en enterprise@testcraft-ai.com para una cotización personalizada.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl p-12 border border-violet-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para optimizar tu proceso de testing?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Únete a miles de QA Engineers que ya están generando casos de prueba 
            profesionales en minutos, no en horas.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-8 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-200 text-lg"
          >
            Comenzar Gratis
            <Check className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}