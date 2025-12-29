"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FileText, Download, Loader2, Plus, X } from "lucide-react"
import { canUseFeature } from "@/lib/stripe"
import { useLanguage } from "@/lib/language-context"

interface TestPlanGeneratorProps {
  userTier?: string
  onSuccess?: (plan: any) => void
}

interface TestCase {
  id: string
  title: string
  priority: 'Alta' | 'Media' | 'Baja'
  type: 'Positivo' | 'Negativo' | 'Borde'
  estimatedTime: number
}

export function TestPlanGenerator({ userTier = 'free', onSuccess }: TestPlanGeneratorProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    scope: "",
    resources: "",
    timeline: "",
  })
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [showAddTestCase, setShowAddTestCase] = useState(false)
  const [newTestCase, setNewTestCase] = useState({
    title: "",
    priority: 'Media' as 'Alta' | 'Media' | 'Baja',
    type: 'Positivo' as 'Positivo' | 'Negativo' | 'Borde',
    estimatedTime: 30,
  })
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addTestCase = () => {
    if (!newTestCase.title.trim()) return

    const testCase: TestCase = {
      id: Date.now().toString(),
      title: newTestCase.title,
      priority: newTestCase.priority,
      type: newTestCase.type,
      estimatedTime: newTestCase.estimatedTime,
    }

    setTestCases(prev => [...prev, testCase])
    setNewTestCase({
      title: "",
      priority: 'Media',
      type: 'Positivo',
      estimatedTime: 30,
    })
    setShowAddTestCase(false)
  }

  const removeTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id))
  }

  const handleGenerate = async () => {
    // Verificar límite de uso
    if (!canUseFeature(userTier, 'PRO')) {
      alert(t.testPlanRequiresPro)
      return
    }

    if (!formData.title.trim()) {
      alert(t.testPlanEnterTitle)
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const planData = {
        ...formData,
        testCases,
        userId: user.id,
        createdAt: new Date().toISOString(),
      }

      // Guardar en base de datos
      const { data, error } = await supabase
        .from('test_plans')
        .insert(planData)
        .select()
        .single()

      if (error) throw error

      // Actualizar contador de uso
      await supabase.rpc('increment_usage', { user_id: user.id })

      if (onSuccess) {
        onSuccess(data)
      } else {
        router.push(`/test-plans/${data.id}`)
      }

    } catch (error) {
      console.error("Generate test plan error:", error)
      alert(t.testPlanGenerationError)
    } finally {
      setIsLoading(false)
    }
  }

  const totalEstimatedTime = testCases.reduce((sum, tc) => sum + tc.estimatedTime, 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-violet-400" />
          <h2 className="text-3xl font-bold text-white">{t.testPlanTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.testPlanTitleLabel}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t.testPlanTitlePlaceholder}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.testPlanTimeline}
            </label>
            <input
              type="text"
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t.testPlanTimelinePlaceholder}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.testPlanDescription}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t.testPlanDescriptionPlaceholder}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.testPlanObjectives}
            </label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t.testPlanObjectivesPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.testPlanScope}
            </label>
            <input
              type="text"
              name="scope"
              value={formData.scope}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t.testPlanScopePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.testPlanResources}
            </label>
            <input
              type="text"
              name="resources"
              value={formData.resources}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder={t.testPlanResourcesPlaceholder}
            />
          </div>
        </div>

        {/* Casos de prueba */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">{t.testPlanTestCases}</h3>
            <button
              onClick={() => setShowAddTestCase(true)}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.testPlanAddButton}
            </button>
          </div>

          {/* Formulario para añadir caso de prueba */}
          {showAddTestCase && (
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  value={newTestCase.title}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t.testPlanCaseTitlePlaceholder}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
                <select
                  value={newTestCase.priority}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
                <select
                  value={newTestCase.type}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="Positivo">Positivo</option>
                  <option value="Negativo">Negativo</option>
                  <option value="Borde">Borde</option>
                </select>
                <input
                  type="number"
                  value={newTestCase.estimatedTime}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                  placeholder="Tiempo (min)"
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  min="1"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addTestCase}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Añadir
                </button>
                <button
                  onClick={() => setShowAddTestCase(false)}
                  className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de casos de prueba */}
          <div className="space-y-2">
            {testCases.map((testCase) => (
              <div key={testCase.id} className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{testCase.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span className={`px-2 py-1 rounded text-xs ${
                      testCase.priority === 'Alta' ? 'bg-red-900 text-red-300' :
                      testCase.priority === 'Media' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {testCase.priority}
                    </span>
                    <span>{testCase.type}</span>
                    <span>{testCase.estimatedTime} min</span>
                  </div>
                </div>
                <button
                  onClick={() => removeTestCase(testCase.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {testCases.length === 0 && (
            <p className="text-slate-400 text-center py-8">
              No has añadido casos de prueba. Puedes generarlos automáticamente después de crear el plan.
            </p>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-slate-800 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300">
                Total de casos de prueba: <span className="font-semibold text-white">{testCases.length}</span>
              </p>
              <p className="text-slate-300">
                Tiempo estimado total: <span className="font-semibold text-white">{totalEstimatedTime} minutos</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">
                Plan: <span className="font-semibold text-violet-400">{userTier}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Botón de generar */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-8 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {t.testPlanGenerate}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}