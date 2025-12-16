/**
 * Client-side rate limiter to prevent spam clicks
 */

type RateLimitConfig = {
  maxAttempts: number
  windowMs: number
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  /**
   * Check if an action is allowed based on rate limits
   * @param key - Unique identifier for the action (e.g., 'login', 'logSale')
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const timestamps = this.attempts.get(key) || []
    
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < config.windowMs
    )

    if (validTimestamps.length >= config.maxAttempts) {
      return false
    }

    // Add current attempt
    validTimestamps.push(now)
    this.attempts.set(key, validTimestamps)
    
    return true
  }

  /**
   * Get remaining time until rate limit resets (in ms)
   */
  getResetTime(key: string, config: RateLimitConfig): number {
    const timestamps = this.attempts.get(key) || []
    if (timestamps.length === 0) return 0

    const oldestTimestamp = Math.min(...timestamps)
    const resetTime = oldestTimestamp + config.windowMs
    const remaining = resetTime - Date.now()
    
    return Math.max(0, remaining)
  }

  /**
   * Clear rate limit for a specific key
   */
  reset(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Clear all rate limits
   */
  resetAll(): void {
    this.attempts.clear()
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Common rate limit configs
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 60000 }, // 5 attempts per minute
  SALE: { maxAttempts: 10, windowMs: 60000 }, // 10 sales per minute
  EXPORT: { maxAttempts: 3, windowMs: 60000 }, // 3 exports per minute
} as const
