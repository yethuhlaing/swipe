import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"


const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Rate limiter configurations
 * You can customize these based on your needs
 */

/**
 * Strict rate limiter - 5 requests per 10 seconds
 * Use for sensitive endpoints like authentication, password reset
 */
export const strictRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:strict",
})

/**
 * Standard rate limiter - 10 requests per 10 seconds
 * Use for general API endpoints
 */
export const standardRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:standard",
})

/**
 * Relaxed rate limiter - 30 requests per minute
 * Use for public or read-only endpoints
 */
export const relaxedRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit:relaxed",
})

/**
 * Email verification rate limiter - 1 request per minute
 * Use for email verification resend endpoints
 */
export const emailVerificationRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:email-verification",
})

/**
 * Rate limit result helper type
 */
export type RateLimitResult = {
    success: boolean
    limit: number
    remaining: number
    reset: number
    pending: Promise<unknown>
}


export async function checkRateLimit(
    ratelimit: Ratelimit,
    identifier: string
): Promise<RateLimitResult> {
    const result = await ratelimit.limit(identifier)

    return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        pending: result.pending,
    }
}

/**
 * Middleware helper for Next.js API routes
 * Returns a Response object if rate limit is exceeded
 */
export async function rateLimitMiddleware(
    ratelimit: Ratelimit,
    identifier: string
): Promise<Response | null> {
    const { success, limit, remaining, reset } = await checkRateLimit(
        ratelimit,
        identifier
    )

    if (!success) {
        return new Response(
            JSON.stringify({
                error: "Too many requests",
                message: "Rate limit exceeded. Please try again later.",
                limit,
                remaining,
                reset: new Date(reset).toISOString(),
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                    "Retry-After": Math.ceil(
                        (reset - Date.now()) / 1000
                    ).toString(),
                },
            }
        )
    }

    return null
}


export function getIpFromRequest(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")

    if (forwarded) {
        return forwarded.split(",")[0].trim()
    }

    if (realIp) {
        return realIp
    }

    return "anonymous"
}


export { redis }
