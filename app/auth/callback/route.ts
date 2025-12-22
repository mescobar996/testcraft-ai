import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_failed`)
      }

      // Si todo está bien, redirigir al home
      return NextResponse.redirect(`${requestUrl.origin}/`)

    } catch (error) {
      console.error("Auth callback exception:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_failed`)
    }
  }

  // Si no hay código, redirigir al login
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}