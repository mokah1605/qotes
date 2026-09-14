import { NextRequest, NextResponse } from "next/server";

const windows = new Map<string, { count: number; resetAt: number }>();

export const QUOTE_CATEGORIES = new Set([
  "Motivation", "Discipline", "Life", "Money", "Love", "Relationship",
  "Friendship", "Breakup", "Wisdom", "Humor", "Success", "General",
]);

export function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function clientKey(request: NextRequest, identity?: string) {
  if (identity) return `user:${identity}`;
  const forwarded = request.headers.get("x-forwarded-for");
  return `ip:${forwarded?.split(",")[0]?.trim() || "unknown"}`;
}

// This protects a single Render instance. Move this state to Redis before scaling out.
export function isRateLimited(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > maxRequests;
}
