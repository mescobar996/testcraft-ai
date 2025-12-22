"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    setGeneralError("")
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      })

      if (error) {
        setGeneralError(error.message === "Invalid login credentials" 
          ? "Email o contraseña incorrectos" 
          : error.message)
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/")
        router.refresh()
      }

    } catch (error) {
      console.error("Login error:", error)
      setGeneralError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage("")
    
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setResetMessage("Por favor, ingresa un email válido")
      return
    }

    setIsSendingReset(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail })
      })

      const data = await response.json()

      if (response.ok) {
        setResetMessage(data.message)
        setTimeout(() => {
          setShowForgotPassword(false)
          setForgotEmail("")
          setResetMessage("")
        }, 3000)
      } else {
        setResetMessage(data.error || "Error al enviar el email")
      }

    } catch (error) {
      console.error("Forgot password error:", error)
      setResetMessage("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsSendingReset(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <button
            onClick={() => setShowForgotPassword(false)}
            className="absolute left-4 top-4 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">Recuperar contraseña</h2>
          <p className="text-slate-400">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label htmlFor="forgotEmail" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="forgotEmail"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={isSendingReset}
            />
          </div>

          {resetMessage && (
            <div className={`p-3 rounded-lg ${
              resetMessage.includes("Error") 
                ? 'bg-red-900/50 border border-red-700' 
                : 'bg-green-900/50 border border-green-700'
            }`}>
              <p className={`text-sm ${
                resetMessage.includes("Error") ? 'text-red-400' : 'text-green-400'
              }`}>
                {resetMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSendingReset}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSendingReset ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </div>
            ) : (
              "Enviar enlace de recuperación"
            )}
          </button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
        <p className="text-slate-400">
          Inicia sesión en tu cuenta de TestCraft AI
        </p>
      </div>

      {generalError && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{generalError}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-slate-700'
          }`}
          placeholder="tu@email.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-slate-700'
            }`}
            placeholder="Tu contraseña"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Iniciando sesión...
          </div>
        ) : (
          "Iniciar sesión"
        )}
      </button>

      <div className="text-center">
        <p className="text-slate-400 text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </form>
  )
}