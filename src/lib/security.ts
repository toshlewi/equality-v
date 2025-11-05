import { NextRequest, NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import { verifyRecaptcha } from './recaptcha'; // We'll create this
import { createAuditLog } from './audit';

// Re-export verifyRecaptcha for convenience
export { verifyRecaptcha };

// Basic rate limiting middleware for Next.js API routes
// Note: This is a simplified example. For production, consider a more robust solution
// like Upstash Redis for distributed rate limiting across multiple instances.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const applyRateLimit = (req: NextRequest, res: NextResponse) => {
  return new Promise((resolve, reject) => {
    limiter(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// CSRF token generation and validation (simplified for Next.js)
// For a full CSRF protection, you'd typically use a library like 'csurf'
// and integrate it with your form submissions.
export const generateCsrfToken = (): string => {
  // In a real application, this would be a cryptographically secure random string
  // stored in a cookie and validated against a hidden form field.
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const validateCsrfToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken;
};

// ReCAPTCHA verification utility
export const verifyHuman = async (recaptchaToken: string): Promise<boolean> => {
  // This function would call your reCAPTCHA verification API endpoint
  // For now, it's a placeholder. The actual verification happens in /api/verify-recaptcha
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-recaptcha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recaptchaToken }),
  });
  const data = await response.json();
  return data.success;
};

// Input sanitization to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Security audit logging
export const logSecurityEvent = async (event: {
  type: string;
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}) => {
  console.log('Security Event:', {
    timestamp: new Date().toISOString(),
    ...event,
  });

  // Log to audit log
  try {
    await createAuditLog({
      eventType: 'security_event',
      description: `Security event: ${event.type}`,
      userId: event.userId,
      ipAddress: event.ip,
      userAgent: event.userAgent,
      metadata: event.details || {},
      severity: event.severity || 'medium',
      isSecurityEvent: true,
      status: 'success'
    });
  } catch (error) {
    console.error('Failed to log security event to audit log:', error);
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};

// IP address validation and blocking
export const isBlockedIP = (ip: string): boolean => {
  // In production, this would check against a database of blocked IPs
  // or a service like Cloudflare's IP reputation database
  const blockedIPs = [
    '127.0.0.1', // Example blocked IP
    // Add more blocked IPs as needed
  ];
  return blockedIPs.includes(ip);
};

// Request validation middleware
export const validateRequest = (req: NextRequest): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check for suspicious patterns
  const userAgent = req.headers.get('user-agent') || '';
  if (userAgent.length < 10) {
    errors.push('Invalid user agent');
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
  for (const header of suspiciousHeaders) {
    const value = req.headers.get(header);
    if (value && value.includes('..')) {
      errors.push(`Suspicious header: ${header}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  applyRateLimit,
  generateCsrfToken,
  validateCsrfToken,
  verifyHuman,
  sanitizeInput,
  logSecurityEvent,
  validatePasswordStrength,
  isBlockedIP,
  validateRequest,
};