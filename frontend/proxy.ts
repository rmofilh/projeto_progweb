import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não precisam de autenticação
const publicRoutes = ['/', '/login', '/signup', '/api/auth'];
const publicPrefixes = ['/light-table', '/_next', '/favicon.ico'];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.includes(path) || 
                        publicPrefixes.some(prefix => path.startsWith(prefix));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verifica o token (simulação) - em produção isso seria checado nos cookies ou cabeçalhos
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redireciona para login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    // Como ainda não temos página de login, permitimos passar para não quebrar a demonstração
    // return NextResponse.redirect(loginUrl);
    console.log(`[Middleware] Acesso bloqueado para: ${path} (Simulado)`);
  }

  // Adicionando headers de segurança recomendados
  const response = NextResponse.next();
  response.headers.set('x-dns-prefetch-control', 'on');
  response.headers.set('x-frame-options', 'SAMEORIGIN');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
