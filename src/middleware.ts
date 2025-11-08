import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

const allowedRoles = new Set(['admin', 'editor', 'reviewer', 'finance']);
const openAdminRoutes = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

const applySecurityHeaders = (response: NextResponse) => {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://api.mailgun.net https://api.mpesa.vm.co.ke https://www.google.com/recaptcha https://vercel.live",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com/recaptcha",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  return response;
};

const adminAuthMiddleware = withAuth(
  (_request) => {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (openAdminRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }
        if (!token?.role) {
          return false;
        }
        return allowedRoles.has(token.role as string);
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

export function middleware(request: NextRequest, event: any) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminAuthMiddleware(request as any, event);
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

