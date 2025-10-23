import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests' } = options;

  return (request: NextRequest): NextResponse | null => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }

    // Get current count for this IP
    const current = rateLimitMap.get(ip);
    
    if (!current) {
      // First request from this IP
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return null; // Allow request
    }

    if (current.resetTime < now) {
      // Window has expired, reset
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return null; // Allow request
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: message,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
          }
        }
      );
    }

    // Increment count
    current.count++;
    rateLimitMap.set(ip, current);
    return null; // Allow request
  };
}

// Predefined rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 API calls per 15 minutes
  message: 'Too many API requests, please try again later'
});

export const formRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 form submissions per minute
  message: 'Too many form submissions, please try again later'
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 uploads per minute
  message: 'Too many file uploads, please try again later'
});

export default {
  createRateLimit,
  authRateLimit,
  apiRateLimit,
  formRateLimit,
  uploadRateLimit,
};
