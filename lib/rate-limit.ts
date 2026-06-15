import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  limit: number;
  window: number;
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = { limit: 10, window: 60 }
): Promise<{ success: boolean; remaining: number }> {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
  const key = `rate_limit:${ip}:${req.nextUrl.pathname}`;

  try {
    const current = await kv.incr(key);
    if (current === 1) {
      await kv.expire(key, options.window);
    }
    const remaining = Math.max(0, options.limit - current);
    return { success: current <= options.limit, remaining };
  } catch {
    return { success: true, remaining: options.limit };
  }
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}
