import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Esquema de validación para registro
const RegisterSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .trim(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validationResult = RegisterSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          error: "Datos de registro inválidos",
          details: errors 
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validationResult.data
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { 
          error: "El usuario ya existe",
          details: "Ya existe una cuenta con este email"
        },
        { status: 409 }
      )
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          created_at: new Date().toISOString(),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { 
          error: "Error al crear usuario",
          details: authError.message 
        },
        { status: 400 }
      )
    }

    // Crear perfil en la tabla users
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 0,
          subscription_tier: 'free'
        })

      if (profileError) {
        console.error("Profile error:", profileError)
        // No devolvemos error al usuario porque el auth ya fue exitoso
      }
    }

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente. Por favor, verifica tu email.",
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        name: authData.user?.user_metadata?.name
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}