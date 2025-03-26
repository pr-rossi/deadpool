interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS = 3; // Maximum requests per window

export function rateLimit(identifier: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimitMap.get(identifier);

  if (!limitInfo) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (now > limitInfo.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (limitInfo.count >= MAX_REQUESTS) {
    return false;
  }

  limitInfo.count += 1;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [identifier, info] of rateLimitMap.entries()) {
    if (now > info.resetTime) {
      rateLimitMap.delete(identifier);
    }
  }
}, 60 * 60 * 1000); // Run cleanup every hour 