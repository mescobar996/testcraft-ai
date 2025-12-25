import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function checkEmailVerified(): Promise<boolean> {
  const supabase = createClientComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // Verificar si el email está confirmado
  return user.email_confirmed_at !== null
}

export async function resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClientComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { success: false, error: 'No hay usuario autenticado' }
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?verified=true`
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error al reenviar el email' }
  }
}
