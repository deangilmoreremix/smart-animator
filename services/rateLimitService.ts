import { supabase } from './supabase';

export type RateLimitAction =
  | 'ai-generation'
  | 'video-generation'
  | 'email-send'
  | 'campaign-create'
  | 'api-call';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
  window: number;
}

class RateLimitService {
  private cache = new Map<string, RateLimitResult & { timestamp: number }>();
  private cacheTimeout = 5000;

  async checkRateLimit(
    action: RateLimitAction,
    customLimit?: number,
    customWindow?: number
  ): Promise<RateLimitResult> {
    const cacheKey = `${action}:${customLimit || ''}:${customWindow || ''}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return {
        allowed: cached.allowed,
        remaining: cached.remaining,
        resetAt: cached.resetAt,
        limit: cached.limit,
        window: cached.window
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          action,
          customLimit,
          customWindow
        }
      });

      if (error) throw error;

      const result: RateLimitResult = {
        allowed: data.allowed,
        remaining: data.remaining,
        resetAt: data.resetAt,
        limit: data.limit,
        window: data.window
      };

      this.cache.set(cacheKey, { ...result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return {
        allowed: true,
        remaining: 999,
        resetAt: new Date(Date.now() + 3600000).toISOString(),
        limit: 1000,
        window: 3600
      };
    }
  }

  async enforceRateLimit(
    action: RateLimitAction,
    customLimit?: number,
    customWindow?: number
  ): Promise<void> {
    const result = await this.checkRateLimit(action, customLimit, customWindow);

    if (!result.allowed) {
      const resetDate = new Date(result.resetAt);
      const waitMinutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);

      throw new Error(
        `Rate limit exceeded for ${action}. ` +
        `Limit: ${result.limit} requests per ${Math.floor(result.window / 60)} minutes. ` +
        `Try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`
      );
    }
  }

  getRemainingForAction(action: RateLimitAction): number | null {
    const cached = Array.from(this.cache.entries())
      .find(([key]) => key.startsWith(action));

    if (!cached) return null;

    const [, value] = cached;
    if (Date.now() - value.timestamp > this.cacheTimeout) {
      return null;
    }

    return value.remaining;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const rateLimitService = new RateLimitService();
