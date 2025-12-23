import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic';

// Esquema de validación
const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .transform(val => val.toLowerCase().trim()),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = ForgotPasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: "Email inválido",
          details: errors 
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data
    const supabase = createRouteHandlerClient({ cookies })

    // Enviar email de recuperación
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("Reset password error:", error)
      return NextResponse.json(
        { 
          error: "Error al enviar el email",
          details: error.message 
        },
        { status: 400 }
      )
    }

    // Siempre devolvemos éxito por seguridad (no revelamos si el email existe)
    return NextResponse.json({
      success: true,
      message: "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña."
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}