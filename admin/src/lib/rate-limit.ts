import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  window: number;
  /**
   * Optional custom identifier function. If not provided, uses IP address.
   */
  identifier?: (request: NextRequest) => string | Promise<string>;
}

/**
 * Rate limit entry stored in memory
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory store for rate limiting
 * In production, consider using Redis or a database for distributed systems
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Get client identifier from request (IP address or custom identifier)
 */
async function getIdentifier(
  request: NextRequest,
  customIdentifier?: (request: NextRequest) => string | Promise<string>
): Promise<string> {
  if (customIdentifier) {
    return await customIdentifier(request);
  }

  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to connection remote address (if available)
  // In Next.js edge runtime, this might not be available
  return "unknown";
}

/**
 * Check if request is within rate limit
 */
async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const key = identifier;

  let entry = rateLimitStore.get(key);

  // If no entry or entry expired, create new one
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.window,
    };
    rateLimitStore.set(key, entry);
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit error response
 */
function rateLimitResponse(resetAt: number): NextResponse {
  const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter: resetIn,
    },
    {
      status: 429,
      headers: {
        "Retry-After": resetIn.toString(),
        "X-RateLimit-Limit": "10", // This will be dynamic in the wrapper
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(resetAt).toISOString(),
      },
    }
  );
}

/**
 * Wrapper function to add rate limiting to Next.js route handlers
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get identifier
      const identifier = await getIdentifier(request, config.identifier);

      // Check rate limit
      const rateLimitResult = await checkRateLimit(identifier, config);

      if (!rateLimitResult.allowed) {
        return rateLimitResponse(rateLimitResult.resetAt);
      }

      // Call the actual handler
      const response = await handler(request);

      // Add rate limit headers to successful responses
      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Limit", config.limit.toString());
      headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
      headers.set(
        "X-RateLimit-Reset",
        new Date(rateLimitResult.resetAt).toISOString()
      );

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("Rate limit error:", error);
      // If rate limiting fails, allow the request through (fail open)
      // You might want to change this behavior in production
      return handler(request);
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  /**
   * Strict rate limit: 10 requests per minute
   * Use for sensitive endpoints like login, registration
   */
  STRICT: { limit: 10, window: 60000 },
  
  /**
   * Standard rate limit: 20 requests per minute
   * Use for most API endpoints
   */
  STANDARD: { limit: 20, window: 60000 },
  
  /**
   * Moderate rate limit: 60 requests per minute
   * Use for read-heavy endpoints
   */
  MODERATE: { limit: 60, window: 60000 },
  
  /**
   * Relaxed rate limit: 200 requests per minute
   * Use for public endpoints
   */
  RELAXED: { limit: 200, window: 60000 },
  
  /**
   * Per hour rate limit: 200 requests per hour
   * Use for expensive operations
   */
  PER_HOUR: { limit: 200, window: 3600000 },
} as const;

