import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { IntegrationSettings } from "@/components/IntegrationSettings"
import { Settings, User, Bell, Shield, CreditCard } from "lucide-react"

export const metadata: Metadata = {
  title: "Configuración - TestCraft AI",
  description: "Configura tu cuenta y preferencias de TestCraft AI",
}

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Verificar autenticación
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login?redirect=/settings')
  }

  // Obtener información del usuario
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier, name, email')
    .eq('id', session.user.id)
    .single()

  const user = {
    name: userData?.name || session.user.user_metadata?.name || '',
    email: userData?.email || session.user.email || '',
    tier: userData?.subscription_tier || 'free',
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Configuración</h1>
          <p className="text-slate-400">
            Gestiona tu cuenta, preferencias e integraciones de TestCraft AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/settings#profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-600 text-white"
                  >
                    <User className="w-4 h-4" />
                    <span>Perfil</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings#integrations"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Integraciones</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/billing"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Billing</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Section */}
            <section id="profile" className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">Perfil de Usuario</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Plan actual
                  </label>
                  <input
                    type="text"
                    value={user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ID de Usuario
                  </label>
                  <input
                    type="text"
                    value={session.user.id.substring(0, 8)} // Mostrar solo los primeros 8 caracteres
                    readOnly
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400">
                  <strong>Nota:</strong> Para cambiar tu nombre o email, por favor contacta al soporte técnico.
                </p>
              </div>
            </section>

            {/* Integrations Section */}
            <section id="integrations" className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">Integraciones</h2>
              </div>

              <IntegrationSettings userTier={user.tier} />
            </section>

            {/* Account Actions */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-violet-400" />
                <h2 className="text-2xl font-bold text-white">Acciones de Cuenta</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Cerrar sesión</h3>
                    <p className="text-slate-400 text-sm">
                      Cierra tu sesión en todos los dispositivos.
                    </p>
                  </div>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </form>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Eliminar cuenta</h3>
                    <p className="text-slate-400 text-sm">
                      Elimina permanentemente tu cuenta y todos los datos asociados.
                    </p>
                  </div>
                  <button
                    className="bg-red-900 text-red-300 py-2 px-4 rounded-lg hover:bg-red-800 hover:text-red-200 transition-colors"
                    onClick={() => alert('Para eliminar tu cuenta, por favor contacta al soporte técnico.')}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}