// middleware.ts
// Middleware de sécurité selon le cahier des charges AGCM
// Note: Pas d'import Prisma/audit ici - le middleware s'exécute en Edge runtime
// où Prisma n'est pas supporté. Les logs d'accès non autorisés sont gérés
// côté API routes (Node.js).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from '@auth/core/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;
  const method = req.method;

  // Fonction helper pour ajouter les headers de sécurité
  function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    return response;
  }

  // ============================================
  // ROUTES PUBLIQUES (visiteurs)
  // ============================================
  const publicPageRoutes = [
    '/',
    '/bureau-actuel',
    '/projets',
    '/evenements',
    '/actualites',
    '/partenaires',
    '/adhesion',
    '/partenariat',
    '/don',
    '/contact',
  ];

  const publicApiRoutes = [
    '/api/public/',
    '/api/auth/',
  ];

  const isPublicPage = publicPageRoutes.some(route => path === route || path.startsWith(route + '/'));
  const isPublicApi = publicApiRoutes.some(route => path.startsWith(route));

  // Routes publiques : pas de vérification
  if (isPublicPage || isPublicApi) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // ============================================
  // PROTECTION : INTERDICTION /register et /inscription
  // ============================================
  if (path === '/register' || path === '/inscription') {
    // Bloquer complètement la création de compte par les visiteurs
    const response = NextResponse.json(
      { error: 'La création de compte n\'est pas autorisée. Contactez l\'administration.' },
      { status: 403 }
    );
    return addSecurityHeaders(response);
  }

  // ============================================
  // ROUTES PROTÉGÉES : Vérification authentification
  // ============================================
  if (!token) {
    // API routes : retourner 401
    if (path.startsWith('/api/')) {
      const response = NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Pages : rediriger vers connexion
    const url = new URL('/connexion', req.url);
    url.searchParams.set('callbackUrl', path);
    const redirectResponse = NextResponse.redirect(url);
    return addSecurityHeaders(redirectResponse);
  }

  const userRole = token.role as string;

  // ============================================
  // PROTECTION ROUTES API SUPER_ADMIN
  // ============================================
  if (path.startsWith('/api/super-admin/')) {
    if (userRole !== 'SUPER_ADMIN') {
      const response = NextResponse.json(
        { error: 'Accès refusé : Super Admin requis' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }
  }

  // ============================================
  // PROTECTION ROUTES API ADMIN
  // ============================================
  if (path.startsWith('/api/admin/')) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      const response = NextResponse.json(
        { error: 'Accès refusé : Admin requis' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }
  }

  // ============================================
  // PROTECTION ROUTES API BUREAU
  // ============================================
  if (path.startsWith('/api/bureau/')) {
    // Vérifier que l'utilisateur a un poste actif
    // Note: Cette vérification sera faite dans chaque route API
    // car elle nécessite une requête DB. Ici on vérifie juste le rôle MEMBER minimum.
    if (!['MEMBER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      const response = NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }
  }

  // ============================================
  // PROTECTION ROUTES API APP (membres)
  // ============================================
  if (path.startsWith('/api/app/')) {
    if (!['MEMBER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      const response = NextResponse.json(
        { error: 'Accès refusé : Membre requis' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }
  }

  // ============================================
  // PROTECTION PAGES ADMIN
  // ============================================
  if (path.startsWith('/admin')) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
      return addSecurityHeaders(redirectResponse);
    }
  }

  // ============================================
  // PROTECTION PAGES BUREAU
  // ============================================
  if (path.startsWith('/bureau')) {
    // Vérification du poste actif sera faite côté page
    if (!['MEMBER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
      return addSecurityHeaders(redirectResponse);
    }
  }

  // ============================================
  // PROTECTION PAGES DASHBOARD
  // ============================================
  if (path.startsWith('/dashboard')) {
    if (!['MEMBER', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      const redirectResponse = NextResponse.redirect(new URL('/connexion', req.url));
      return addSecurityHeaders(redirectResponse);
    }
  }

  // Autoriser l'accès
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// Configuration : routes à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|Image|images|public).*)',
  ],
};
