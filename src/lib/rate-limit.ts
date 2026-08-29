import 'server-only';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { authAttempts } from '@/db/schema';

/** Best-effort client IP from proxy headers (Server Actions have no direct socket access). */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headerStore.get('x-real-ip') ?? 'unknown';
}

// Credential-stuffing/brute-force throttle for signInAction/signUpAction,
// keyed by email+IP (same spirit as otpTokens.attempts, DB-backed so it
// survives restarts and works across multiple server instances).
const WINDOW_MS = 15 * 60 * 1000; // attempts reset if the window has elapsed
const MAX_ATTEMPTS_PER_WINDOW = 10;
const LOCKOUT_MS = 15 * 60 * 1000; // how long a tripped identifier is blocked

export interface RateLimitResult {
  limited: boolean;
  retryAfterMs?: number;
}

/** Call before attempting auth. Does not itself count as an attempt — pair with recordAuthAttempt(). */
export async function checkAuthRateLimit(email: string, ip: string): Promise<RateLimitResult> {
  const identifier = `${email.toLowerCase()}:${ip}`;
  const now = new Date();

  const [row] = await db.select().from(authAttempts).where(eq(authAttempts.identifier, identifier)).limit(1);
  if (row?.lockedUntil && row.lockedUntil > now) {
    return { limited: true, retryAfterMs: row.lockedUntil.getTime() - now.getTime() };
  }

  return { limited: false };
}

/** Call after every sign-in/sign-up attempt (success or failure) to update the throttle counter. */
export async function recordAuthAttempt(email: string, ip: string): Promise<void> {
  const identifier = `${email.toLowerCase()}:${ip}`;
  const now = new Date();

  const [row] = await db.select().from(authAttempts).where(eq(authAttempts.identifier, identifier)).limit(1);

  if (!row || now.getTime() - row.windowStartedAt.getTime() > WINDOW_MS) {
    await db
      .insert(authAttempts)
      .values({ identifier, attempts: 1, windowStartedAt: now, lockedUntil: null })
      .onConflictDoUpdate({
        target: authAttempts.identifier,
        set: { attempts: 1, windowStartedAt: now, lockedUntil: null },
      });
    return;
  }

  const attempts = row.attempts + 1;
  const lockedUntil = attempts >= MAX_ATTEMPTS_PER_WINDOW ? new Date(now.getTime() + LOCKOUT_MS) : null;
  await db.update(authAttempts).set({ attempts, lockedUntil }).where(eq(authAttempts.identifier, identifier));
}

/** Call after a successful sign-in so a legitimate user isn't penalized by earlier failed attempts. */
export async function clearAuthAttempts(email: string, ip: string): Promise<void> {
  const identifier = `${email.toLowerCase()}:${ip}`;
  await db.delete(authAttempts).where(eq(authAttempts.identifier, identifier));
}
