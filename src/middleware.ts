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

  // Content Security Policy - FIXED for reCAPTCHA v3
  const contentSecurityPolicy = [
    "default-src 'self'",
    // Script sources - allow reCAPTCHA, Stripe, and Vercel Live
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.google.com https://js.stripe.com https://vercel.live",
    // Style sources - allow Google Fonts and reCAPTCHA
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    // Font sources - allow Google Fonts
    "font-src 'self' https://fonts.gstatic.com",
    // Image sources
    "img-src 'self' data: https: blob:",
    // Connect sources - allow API calls to reCAPTCHA, Stripe, etc.
    "connect-src 'self' https://api.stripe.com https://api.mailgun.net https://api.mpesa.vm.co.ke https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.google.com https://vercel.live",
    // Frame sources - FIXED: Allow all required Google domains for reCAPTCHA iframes
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://recaptcha.google.com",
    // Other security directives
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
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
        
        // Allow access to open admin routes (login, password reset)
        if (openAdminRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }
        
        // Require authentication and specific roles for other admin routes
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
  // Apply admin authentication for /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminAuthMiddleware(request as any, event);
  }

  // Apply security headers to all other routes
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};