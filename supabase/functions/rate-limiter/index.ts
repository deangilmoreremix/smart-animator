import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RateLimitConfig {
  key: string;
  limit: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const cached = rateLimitCache.get(config.key);

  if (!cached || cached.resetAt <= now) {
    const resetAt = now + (config.windowSeconds * 1000);
    rateLimitCache.set(config.key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt
    };
  }

  if (cached.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: cached.resetAt
    };
  }

  cached.count++;
  return {
    allowed: true,
    remaining: config.limit - cached.count,
    resetAt: cached.resetAt
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitCache.entries()) {
    if (value.resetAt <= now) {
      rateLimitCache.delete(key);
    }
  }
}, 60000);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, customLimit, customWindow }: {
      action: string;
      customLimit?: number;
      customWindow?: number;
    } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const limits: Record<string, { limit: number; windowSeconds: number }> = {
      'ai-generation': { limit: 100, windowSeconds: 3600 },
      'video-generation': { limit: 20, windowSeconds: 3600 },
      'email-send': { limit: 1000, windowSeconds: 3600 },
      'campaign-create': { limit: 10, windowSeconds: 3600 },
      'api-call': { limit: 1000, windowSeconds: 60 },
    };

    const config = limits[action] || { limit: customLimit || 100, windowSeconds: customWindow || 3600 };
    const key = `${user.id}:${action}`;

    const result = checkRateLimit({
      key,
      limit: config.limit,
      windowSeconds: config.windowSeconds
    });

    const response = {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: new Date(result.resetAt).toISOString(),
      limit: config.limit,
      window: config.windowSeconds
    };

    return new Response(
      JSON.stringify(response),
      {
        status: result.allowed ? 200 : 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetAt.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        allowed: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});