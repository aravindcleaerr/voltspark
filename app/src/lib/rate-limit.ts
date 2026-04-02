/**
 * Simple in-memory rate limiter for serverless.
 * Uses a sliding window per key. Resets on cold start (acceptable for MVP).
 */
const windowMs = 60 * 1000; // 1 minute window
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // Lazy cleanup when store grows large
    if (store.size > 1000) {
      const toDelete: string[] = [];
      store.forEach((v, k) => { if (v.resetAt < now) toDelete.push(k); });
      toDelete.forEach(k => store.delete(k));
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
