import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/LoginForm"

export const metadata: Metadata = {
  title: "Iniciar sesión - TestCraft AI",
  description: "Inicia sesión en TestCraft AI y genera casos de prueba profesionales con IA.",
}

export const dynamic = 'force-dynamic' // Importante: fuerza renderizado dinámico

export default function LoginPage() {
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

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium">
              Crea una cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}