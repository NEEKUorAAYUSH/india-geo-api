import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Connect to your new Mumbai Redis database
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a sliding window rate limiter: 5,000 requests per 24 hours (Free Tier)
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5000, '24 h'),
  analytics: true, 
});

export async function middleware(request: NextRequest) {
  // We only want to rate limit the API routes, not the dashboard UI
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Identify the user by their API Key (or IP address if no key is provided)
    const apiKey = request.headers.get('x-api-key') || request.ip || 'anonymous';
    
    // Check their usage against Redis
    const { success, limit, reset, remaining } = await ratelimit.limit(apiKey);
    
    // If they exceeded 5000 requests, block them with a 429 status
    const res = success 
      ? NextResponse.next() 
      : NextResponse.json({ error: 'RATE_LIMITED: Daily quota exceeded. Please upgrade your plan.' }, { status: 429 });

    // Append the exact security headers requested in Section 10.4
    res.headers.set('X-RateLimit-Limit', limit.toString());
    res.headers.set('X-RateLimit-Remaining', remaining.toString());
    res.headers.set('X-RateLimit-Reset', reset.toString());

    return res;
  }
  
  return NextResponse.next();
}

// Tell Next.js to only run this middleware on API routes
export const config = {
  matcher: '/api/:path*',
};