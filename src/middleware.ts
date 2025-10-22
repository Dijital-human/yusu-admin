/**
 * Middleware for Role-based Access Control / Rol əsaslı Giriş Nəzarəti üçün Middleware
 * This middleware protects routes based on user roles
 * Bu middleware istifadəçi rollarına əsasən route-ları qoruyur
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SimpleAdminAuth } from '@/lib/auth/simple-admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication / Autentifikasiya tələb etməyən ictimai route-lar
  const publicRoutes = [
    "/",
    "/auth/admin-login",
    "/auth/admin-recovery",
    "/auth/error",
    "/unauthorized"
  ];

  // Check if route is public / Route-un ictimai olub-olmadığını yoxla
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Admin routes protection / Admin route-larının qorunması
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin-token')?.value;
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }
    
    try {
      const adminData = SimpleAdminAuth.verifyAdminToken(adminToken);
      
      if (!adminData.isAdmin) {
        return NextResponse.redirect(new URL('/auth/admin-login', request.url));
      }
      
      // Admin məlumatlarını header-ə əlavə et
      const response = NextResponse.next();
      response.headers.set('x-admin-id', adminData.id);
      response.headers.set('x-admin-role', adminData.role);
      
      return response;
      
    } catch (error) {
      console.error('Admin token verification failed:', error);
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }
  }

  // For other routes, allow access / Digər route-lar üçün girişə icazə ver
  return NextResponse.next();
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
