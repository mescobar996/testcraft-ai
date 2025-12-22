import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema de validación
const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
  token: z
    .string()
    .min(1, "Token requerido"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = ResetPasswordSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: "Datos inválidos",
          details: errors 
        },
        { status: 400 }
      )
    }

    const { password, token } = validationResult.data
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar el token y actualizar contraseña
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      console.error("Reset password error:", error)
      return NextResponse.json(
        { 
          error: "Error al restablecer la contraseña",
          details: error.message 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida exitosamente. Puedes iniciar sesión con tu nueva contraseña."
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}