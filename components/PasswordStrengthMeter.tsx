"use client"

import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
}

export interface PasswordRequirement {
  label: string
  met: boolean
}

export function calculatePasswordStrength(password: string): {
  score: number
  strength: 'weak' | 'fair' | 'good' | 'strong'
  requirements: PasswordRequirement[]
} {
  const requirements: PasswordRequirement[] = [
    {
      label: "Mínimo 8 caracteres",
      met: password.length >= 8
    },
    {
      label: "Una letra mayúscula",
      met: /[A-Z]/.test(password)
    },
    {
      label: "Una letra minúscula",
      met: /[a-z]/.test(password)
    },
    {
      label: "Un número",
      met: /[0-9]/.test(password)
    },
    {
      label: "Un carácter especial (@$!%*?&#)",
      met: /[@$!%*?&#]/.test(password)
    }
  ]

  // Calcular score basado en requisitos cumplidos
  const metCount = requirements.filter(r => r.met).length
  const score = (metCount / requirements.length) * 100

  // Determinar nivel de fortaleza
  let strength: 'weak' | 'fair' | 'good' | 'strong'
  if (score < 40) strength = 'weak'
  else if (score < 60) strength = 'fair'
  else if (score < 80) strength = 'good'
  else strength = 'strong'

  return { score, strength, requirements }
}

export function PasswordStrengthMeter({ password, showRequirements = true }: PasswordStrengthMeterProps) {
  if (!password) return null

  const { score, strength, requirements } = calculatePasswordStrength(password)

  const strengthConfig = {
    weak: {
      color: 'bg-red-500',
      text: 'Débil',
      textColor: 'text-red-400'
    },
    fair: {
      color: 'bg-orange-500',
      text: 'Regular',
      textColor: 'text-orange-400'
    },
    good: {
      color: 'bg-yellow-500',
      text: 'Buena',
      textColor: 'text-yellow-400'
    },
    strong: {
      color: 'bg-green-500',
      text: 'Fuerte',
      textColor: 'text-green-400'
    }
  }

  const config = strengthConfig[strength]

  return (
    <div className="space-y-2">
      {/* Barra de progreso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Fortaleza de contraseña</span>
          <span className={`font-medium ${config.textColor}`}>{config.text}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${config.color} transition-all duration-300`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Lista de requisitos */}
      {showRequirements && (
        <div className="space-y-1.5 mt-3">
          <p className="text-xs text-slate-400 font-medium">Requisitos:</p>
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              {req.met ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span className={req.met ? 'text-green-400' : 'text-slate-500'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
