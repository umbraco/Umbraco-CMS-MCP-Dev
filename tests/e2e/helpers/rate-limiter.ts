/**
 * E2E SDK Rate Limiter
 *
 * Tracks token usage and delays when approaching rate limits.
 * Based on Anthropic's rate limit system:
 * - ITPM: Input tokens per minute
 * - OTPM: Output tokens per minute
 * - RPM: Requests per minute
 *
 * Uses token bucket algorithm (continuous replenishment).
 *
 * @see https://platform.claude.com/docs/en/api/rate-limits
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
}

/**
 * Rate limits configuration
 * Defaults to Tier 1 Claude Haiku 3.5 limits, but can be overridden via env vars
 */
const RATE_LIMITS = {
  /** Input tokens per minute */
  ITPM: parseInt(process.env.E2E_RATE_LIMIT_ITPM || "50000", 10),
  /** Output tokens per minute */
  OTPM: parseInt(process.env.E2E_RATE_LIMIT_OTPM || "10000", 10),
  /** Requests per minute */
  RPM: parseInt(process.env.E2E_RATE_LIMIT_RPM || "50", 10),
};

/** Safety buffer percentage (default 10%) */
const SAFETY_BUFFER_PCT = parseInt(process.env.E2E_RATE_LIMIT_BUFFER_PCT || "10", 10) / 100;

/** Time window in ms (1 minute) */
const WINDOW_MS = 60000;

class RateLimiter {
  private usageLog: TokenUsage[] = [];
  private requestTimestamps: number[] = [];

  /**
   * Record token usage from a completed test
   */
  recordUsage(inputTokens: number, outputTokens: number): void {
    const now = Date.now();
    this.usageLog.push({ inputTokens, outputTokens, timestamp: now });
    this.requestTimestamps.push(now);
    this.cleanup();
  }

  /**
   * Remove entries older than the time window
   */
  private cleanup(): void {
    const cutoff = Date.now() - WINDOW_MS;
    this.usageLog = this.usageLog.filter(entry => entry.timestamp > cutoff);
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > cutoff);
  }

  /**
   * Get current usage in the time window
   */
  getUsage(): { inputTokens: number; outputTokens: number; requests: number } {
    this.cleanup();
    return {
      inputTokens: this.usageLog.reduce((sum, e) => sum + e.inputTokens, 0),
      outputTokens: this.usageLog.reduce((sum, e) => sum + e.outputTokens, 0),
      requests: this.requestTimestamps.length,
    };
  }

  /**
   * Get available capacity (with safety buffer)
   */
  getAvailable(): { inputTokens: number; outputTokens: number; requests: number } {
    const usage = this.getUsage();
    const safeITPM = RATE_LIMITS.ITPM * (1 - SAFETY_BUFFER_PCT);
    const safeOTPM = RATE_LIMITS.OTPM * (1 - SAFETY_BUFFER_PCT);
    const safeRPM = RATE_LIMITS.RPM * (1 - SAFETY_BUFFER_PCT);

    return {
      inputTokens: Math.max(0, safeITPM - usage.inputTokens),
      outputTokens: Math.max(0, safeOTPM - usage.outputTokens),
      requests: Math.max(0, safeRPM - usage.requests),
    };
  }

  /**
   * Calculate delay needed before running a test with estimated token usage
   * Returns delay in ms, or 0 if no delay needed
   */
  getRequiredDelay(estimatedInput: number, estimatedOutput: number): number {
    this.cleanup();
    const available = this.getAvailable();

    // Check if we have capacity for all three limits
    const needsInputWait = estimatedInput > available.inputTokens;
    const needsOutputWait = estimatedOutput > available.outputTokens;
    const needsRequestWait = available.requests < 1;

    if (!needsInputWait && !needsOutputWait && !needsRequestWait) {
      return 0;
    }

    // Find when enough capacity will be freed
    const now = Date.now();
    let maxDelay = 0;

    if (needsInputWait) {
      const delay = this.calculateDelayForTokens(estimatedInput, available.inputTokens, 'input');
      maxDelay = Math.max(maxDelay, delay);
    }

    if (needsOutputWait) {
      const delay = this.calculateDelayForTokens(estimatedOutput, available.outputTokens, 'output');
      maxDelay = Math.max(maxDelay, delay);
    }

    if (needsRequestWait && this.requestTimestamps.length > 0) {
      // Wait for oldest request to expire
      const oldestRequest = Math.min(...this.requestTimestamps);
      const expiresAt = oldestRequest + WINDOW_MS;
      maxDelay = Math.max(maxDelay, expiresAt - now + 1000);
    }

    return maxDelay;
  }

  /**
   * Calculate delay needed for a specific token type
   */
  private calculateDelayForTokens(
    needed: number,
    available: number,
    type: 'input' | 'output'
  ): number {
    const shortfall = needed - available;
    if (shortfall <= 0) return 0;

    const now = Date.now();
    let freedTokens = 0;

    // Sort entries by timestamp (oldest first)
    const sorted = [...this.usageLog].sort((a, b) => a.timestamp - b.timestamp);

    for (const entry of sorted) {
      freedTokens += type === 'input' ? entry.inputTokens : entry.outputTokens;
      if (freedTokens >= shortfall) {
        // Wait until this entry expires
        const expiresAt = entry.timestamp + WINDOW_MS;
        return Math.max(0, expiresAt - now + 1000); // +1s buffer
      }
    }

    // If we get here, wait for the full window
    return WINDOW_MS;
  }

  /**
   * Get rate limiter status for logging
   */
  getStatus(): {
    usage: { inputTokens: number; outputTokens: number; requests: number };
    limits: { ITPM: number; OTPM: number; RPM: number };
    available: { inputTokens: number; outputTokens: number; requests: number };
  } {
    return {
      usage: this.getUsage(),
      limits: RATE_LIMITS,
      available: this.getAvailable(),
    };
  }

  /**
   * Reset the rate limiter (for testing)
   */
  reset(): void {
    this.usageLog = [];
    this.requestTimestamps = [];
  }
}

// Singleton instance for sharing across tests
export const rateLimiter = new RateLimiter();

/**
 * Wait if necessary to avoid rate limits
 *
 * @param estimatedInput - Estimated input tokens for the upcoming test (default: 1500)
 * @param estimatedOutput - Estimated output tokens for the upcoming test (default: 500)
 */
export async function waitForRateLimit(estimatedInput = 1500, estimatedOutput = 500): Promise<void> {
  const delay = rateLimiter.getRequiredDelay(estimatedInput, estimatedOutput);

  if (delay > 0) {
    const status = rateLimiter.getStatus();
    console.log(`\n⏳ Rate limit approaching:`);
    console.log(`   Input:  ${status.usage.inputTokens}/${status.limits.ITPM} ITPM`);
    console.log(`   Output: ${status.usage.outputTokens}/${status.limits.OTPM} OTPM`);
    console.log(`   Requests: ${status.usage.requests}/${status.limits.RPM} RPM`);
    console.log(`   Waiting ${Math.ceil(delay / 1000)}s before next test...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Record token usage after a test completes
 */
export function recordTokenUsage(inputTokens: number, outputTokens: number): void {
  rateLimiter.recordUsage(inputTokens, outputTokens);
  const status = rateLimiter.getStatus();
  console.log(`📊 Tokens: in=${inputTokens} out=${outputTokens} | Window: ${status.usage.inputTokens}/${status.limits.ITPM} ITPM, ${status.usage.outputTokens}/${status.limits.OTPM} OTPM`);
}
