import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Páginas que NÃO precisam de autenticação
const PUBLIC_PATHS = ['/login', '/signup', '/forgotpassword', '/resetpassword', '/approvedteacher', '/pendingapproval']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Deixa passar rotas públicas e assets
  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  if (isPublic) return NextResponse.next()

  // Se não tem token → redireciona para login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname) // opcional: guarda para onde queria ir
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aplica a tudo EXCETO _next, api, e ficheiros estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}