import { NextRequest, NextResponse } from 'next/server';
import { authRateLimit, apiRateLimit, formRateLimit, uploadRateLimit } from './rate-limit';
import { validateRequest, logSecurityEvent, isBlockedIP } from './security';

// Security middleware for API routes
export function withApiSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: 'auth' | 'api' | 'form' | 'upload' | 'none';
    requireAuth?: boolean;
    requireRecaptcha?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const url = request.url;

    // Check if IP is blocked
    if (isBlockedIP(ip)) {
      await logSecurityEvent({
        eventType: 'security_event',
        description: 'Blocked IP attempt',
        ipAddress: ip,
        userAgent,
        requestMethod: request.method,
        requestUrl: url,
        severity: 'high',
        isSecurityEvent: true,
        status: 'failure'
      });

      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Validate request for suspicious patterns
    const validation = validateRequest(request);
    if (!validation.isValid) {
      await logSecurityEvent({
        eventType: 'security_event',
        description: `Suspicious request: ${validation.errors.join(', ')}`,
        ipAddress: ip,
        userAgent,
        requestMethod: request.method,
        requestUrl: url,
        severity: 'medium',
        isSecurityEvent: true,
        status: 'failure'
      });

      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Apply rate limiting
    if (options.rateLimit && options.rateLimit !== 'none') {
      let rateLimitResponse: NextResponse | null = null;

      switch (options.rateLimit) {
        case 'auth':
          rateLimitResponse = authRateLimit(request);
          break;
        case 'api':
          rateLimitResponse = apiRateLimit(request);
          break;
        case 'form':
          rateLimitResponse = formRateLimit(request);
          break;
        case 'upload':
          rateLimitResponse = uploadRateLimit(request);
          break;
      }

      if (rateLimitResponse) {
        await logSecurityEvent({
          eventType: 'security_event',
          description: 'Rate limit exceeded',
          ipAddress: ip,
          userAgent,
          requestMethod: request.method,
          requestUrl: url,
          severity: 'medium',
          isSecurityEvent: true,
          status: 'failure'
        });

        return rateLimitResponse;
      }
    }

    // Check authentication if required
    if (options.requireAuth) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Check reCAPTCHA if required
    if (options.requireRecaptcha) {
      const body = await request.json();
      if (!body.recaptchaToken) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification required' },
          { status: 400 }
        );
      }

      // Verify reCAPTCHA token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-recaptcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recaptchaToken: body.recaptchaToken }),
      });

      const data = await response.json();
      if (!data.success) {
        await logSecurityEvent({
          eventType: 'security_event',
          description: 'reCAPTCHA verification failed',
          ipAddress: ip,
          userAgent,
          requestMethod: request.method,
          requestUrl: url,
          severity: 'medium',
          isSecurityEvent: true,
          status: 'failure'
        });

        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    // Call the original handler
    try {
      const response = await handler(request);

      // Log successful API access
      await logSecurityEvent({
        eventType: 'api_access',
        description: `API access: ${request.method} ${url}`,
        ipAddress: ip,
        userAgent,
        requestMethod: request.method,
        requestUrl: url,
        severity: 'low',
        status: 'success'
      });

      return response;
    } catch (error) {
      // Log API errors
      await logSecurityEvent({
        eventType: 'system_error',
        description: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress: ip,
        userAgent,
        requestMethod: request.method,
        requestUrl: url,
        severity: 'high',
        status: 'failure'
      });

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Express rate limit (alias for withApiSecurity)
export const expressRateLimit = withApiSecurity;

export default withApiSecurity;
