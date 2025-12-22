import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Rutas que requieren autenticación
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/settings',
      '/billing'
    ]

    // Rutas de autenticación (no accesibles si ya está autenticado)
    const authRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password'
    ]

    const path = request.nextUrl.pathname

    // Si está autenticado e intenta acceder a rutas de auth, redirigir al home
    if (session && authRoutes.some(route => path.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Si no está autenticado e intenta acceder a rutas protegidas, redirigir al login
    if (!session && protectedRoutes.some(route => path.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + encodeURIComponent(path), request.url))
    }

    return response

  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}