"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

// Componente separado que usa useSearchParams
function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Verificar que hay un token válido al cargar la página
    const checkToken = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          setGeneralError(t.resetPasswordError)
        }
      } catch (error) {
        console.error("Token check error:", error)
        setGeneralError(t.resetPasswordError)
      } finally {
        setIsChecking(false)
      }
    }

    checkToken()
  }, [supabase.auth, t])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!password) {
      newErrors.password = t.resetPasswordRequired
    } else if (password.length < 8) {
      newErrors.password = t.resetPasswordMinLength
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = t.resetPasswordComplexity
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t.resetPasswordConfirmRequired
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t.resetPasswordMismatch
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    setSuccessMessage("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        setGeneralError(error.message)
        return
      }

      setSuccessMessage(t.resetPasswordSuccess)
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/")
      }, 2000)

    } catch (error) {
      console.error("Reset password error:", error)
      setGeneralError(t.resetPasswordError)
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">{t.resetPasswordVerifying}</p>
        </div>
      </div>
    )
  }

  if (generalError && !successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">TestCraft AI</span>
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t.resetPasswordInvalidLink}</h2>
            <p className="text-slate-400 mb-6">{generalError}</p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 px-4 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 transition-all duration-200"
            >
              {t.resetPasswordNewLink}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t.resetPasswordTitle}</h2>
        <p className="text-slate-400">
          {t.resetPasswordSubtitle}
        </p>
      </div>

      {generalError && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{generalError}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-3">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
          {t.resetPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-slate-700'
            }`}
            placeholder={t.resetPasswordPlaceholder}
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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
          {t.resetPasswordConfirmLabel}
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
            }`}
            placeholder={t.resetPasswordConfirmPlaceholder}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3 px-4 rounded-lg font-medium hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.resetPasswordUpdating}
          </div>
        ) : (
          t.resetPasswordButton
        )}
      </button>
    </form>
  )
}

// Componente principal con Suspense
export default function ResetPasswordPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">TestCraft AI</span>
          </Link>
        </div>

        {/* Card con Suspense */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">{t.resetPasswordVerifying}</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            {t.resetPasswordRemember}{" "}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
              {t.signInButton}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}