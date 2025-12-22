"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Settings, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { canUseFeature } from "@/lib/stripe"

interface IntegrationSettingsProps {
  userTier?: string
}

export function IntegrationSettings({ userTier = 'free' }: IntegrationSettingsProps) {
  const [jiraConfig, setJiraConfig] = useState({
    domain: "",
    email: "",
    apiToken: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadJiraConfig()
  }, [])

  const loadJiraConfig = async () => {
    if (!canUseFeature(userTier, 'PRO')) return

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const response = await fetch('/api/integrations/jira')
      const data = await response.json()

      if (data.configured) {
        setIsConfigured(true)
        setProjects(data.projects || [])
        // No cargamos los valores reales por seguridad
        setJiraConfig({
          domain: "✓ Configurado",
          email: "✓ Configurado", 
          apiToken: "••••••••••••••••",
        })
      }
    } catch (error) {
      console.error("Load Jira config error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveJiraConfig = async () => {
    if (!canUseFeature(userTier, 'PRO')) {
      alert('La integración con Jira requiere un plan Pro o Enterprise')
      return
    }

    // Si ya está configurado y no se ha cambiado nada, no hacer nada
    if (isConfigured && jiraConfig.apiToken === "••••••••••••••••") {
      return
    }

    // Validar campos
    if (!jiraConfig.domain || !jiraConfig.email || !jiraConfig.apiToken) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Guardar configuración en Supabase
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          jira_domain: jiraConfig.domain,
          jira_email: jiraConfig.email,
          jira_api_token: jiraConfig.apiToken,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setSaveStatus('success')
      setIsConfigured(true)
      
      // Probar conexión y cargar proyectos
      await loadJiraProjects()

      // Limpiar campos después de guardar
      setTimeout(() => {
        setJiraConfig({
          domain: "✓ Configurado",
          email: "✓ Configurado",
          apiToken: "••••••••••••••••",
        })
      }, 1000)

    } catch (error) {
      console.error("Save Jira config error:", error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const loadJiraProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const response = await fetch('/api/integrations/jira')
      const data = await response.json()

      if (data.success && data.projects) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error("Load Jira projects error:", error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const handleEditConfig = () => {
    setJiraConfig({
      domain: "",
      email: "",
      apiToken: "",
    })
    setIsConfigured(false)
    setProjects([])
  }

  return (
    <div className="space-y-8">
      {/* Jira Integration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">Integración con Jira</h2>
          </div>
          {!canUseFeature(userTier, 'PRO') && (
            <span className="bg-yellow-900/50 text-yellow-300 px-3 py-1 rounded-full text-sm">
              Requiere Plan Pro
            </span>
          )}
        </div>

        {!canUseFeature(userTier, 'PRO') ? (
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-slate-300 mb-4">
              La integración con Jira está disponible en planes Pro y Enterprise.
            </p>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 px-4 rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all"
            >
              Actualizar Plan
            </a>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dominio de Jira Cloud
                </label>
                <input
                  type="text"
                  value={jiraConfig.domain}
                  onChange={(e) => setJiraConfig(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="tu-empresa.atlassian.net"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isConfigured}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Tu dominio de Jira Cloud (sin https://)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email de Jira
                </label>
                <input
                  type="email"
                  value={jiraConfig.email}
                  onChange={(e) => setJiraConfig(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu-email@ejemplo.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isConfigured}
                />
                <p className="text-xs text-slate-400 mt-1">
                  El email asociado a tu cuenta de Jira
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Token de Jira
                </label>
                <input
                  type="password"
                  value={jiraConfig.apiToken}
                  onChange={(e) => setJiraConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isConfigured}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Crea un token en: Configuración de cuenta → Seguridad → Crear y administrar tokens de API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              {isConfigured ? (
                <>
                  <button
                    onClick={handleEditConfig}
                    className="bg-slate-600 text-white py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Editar Configuración
                  </button>
                  <button
                    onClick={loadJiraProjects}
                    disabled={isLoadingProjects}
                    className="flex items-center gap-2 bg-violet-600 text-white py-3 px-6 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    {isLoadingProjects ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        Probar Conexión
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveJiraConfig}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-6 rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Configuración
                    </>
                  )}
                </button>
              )}

              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Configuración guardada</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>Error al guardar</span>
                </div>
              )}
            </div>

            {/* Proyectos de Jira */}
            {projects.length > 0 && (
              <div className="mt-8 p-6 bg-slate-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Proyectos Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-slate-700 rounded-lg p-3"
                    >
                      <p className="font-medium text-white">{project.name}</p>
                      <p className="text-sm text-slate-400">Key: {project.key}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  ✅ Conexión exitosa con Jira. Puedes ahora crear issues directamente desde TestCraft AI.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* TestRail Integration (Placeholder para Enterprise) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-fuchsia-400" />
            <h2 className="text-2xl font-bold text-white">Integración con TestRail</h2>
          </div>
          <span className="bg-fuchsia-900/50 text-fuchsia-300 px-3 py-1 rounded-full text-sm">
            Enterprise
          </span>
        </div>

        {!canUseFeature(userTier, 'ENTERPRISE') ? (
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
            <p className="text-slate-300 mb-4">
              La integración con TestRail está disponible exclusivamente en el plan Enterprise.
            </p>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white py-2 px-4 rounded-lg hover:from-fuchsia-700 hover:to-violet-700 transition-all"
            >
              Ver Plan Enterprise
            </a>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <Settings className="w-12 h-12 text-fuchsia-400 mx-auto mb-4" />
            <p className="text-slate-300 mb-4">
              La integración con TestRail Enterprise está disponible. 
              Contáctanos para configurar tu instancia.
            </p>
            <a
              href="mailto:enterprise@testcraft-ai.com"
              className="inline-flex items-center gap-2 bg-fuchsia-600 text-white py-2 px-4 rounded-lg hover:bg-fuchsia-700 transition-all"
            >
              Configurar TestRail
            </a>
          </div>
        )}
      </div>
    </div>
  )
}