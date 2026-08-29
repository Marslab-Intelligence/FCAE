import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { sessions, users } from '@/db/schema';

export const SESSION_COOKIE = 'mercury_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// The cookie stores `${sessionId}.${hmacSignature}` rather than a bare
// session id. The id is already an unguessable random UUID validated
// against the DB on every request, so this isn't guarding against ID
// guessing — it's so a tampered/forged cookie value is rejected before it
// ever reaches the DB lookup, and a raw DB session id leaked via another
// channel (e.g. a log line) can't be replayed as a cookie without also
// knowing SESSION_SECRET.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Generate one with `openssl rand -base64 32` and set it in your environment.',
    );
  }
  return secret;
}

function signSessionId(sessionId: string): string {
  const signature = createHmac('sha256', getSessionSecret()).update(sessionId).digest('hex');
  return `${sessionId}.${signature}`;
}

/** Verifies a raw cookie value and returns the session id, or null if missing/invalid/tampered. */
function verifySessionCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const separatorIndex = value.lastIndexOf('.');
  if (separatorIndex === -1) return null;

  const sessionId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expectedSignature = createHmac('sha256', getSessionSecret()).update(sessionId).digest('hex');

  const signatureBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');
  if (signatureBuf.length !== expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)) {
    return null;
  }
  return sessionId;
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const [session] = await db
    .insert(sessions)
    .values({
      id: randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    })
    .returning();
  return session.id;
}

/** Builds the signed cookie value + options for a session id, for callers that need to set it on a NextResponse directly (e.g. an OAuth callback redirect) instead of via `cookies()`. */
export function buildSessionCookie(sessionId: string) {
  return { name: SESSION_COOKIE, value: signSessionId(sessionId), options: sessionCookieOptions() };
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  const { name, value, options } = buildSessionCookie(sessionId);
  cookieStore.set(name, value, options);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const sessionId = verifySessionCookieValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (sessionId) {
    try {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    } catch (err) {
      // Never let a DB hiccup block sign-out — the cookie is still cleared
      // and the orphaned session row is harmless (it expires on its own).
      console.warn('[Auth] Failed to remove session from DB during sign-out:', err);
    }
  }
  cookieStore.delete(SESSION_COOKIE);
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
}

// ---- Session-lookup circuit breaker ----
// `getCurrentUser()` runs on (nearly) every request, so when the database is
// unreachable we must degrade to an anonymous visitor instead of hammering the
// DB and spamming the console on every render.
const DB_COOLDOWN_MS = 15_000; // skip lookups for 15s after a failure
const DB_LOG_INTERVAL_MS = 60_000; // log the outage at most once per minute

let dbDownUntil = 0;
let dbFailureLoggedAt = 0;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionId = verifySessionCookieValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!sessionId) return null;

  // DB is in the cooldown window — serve as logged-out without querying.
  if (Date.now() < dbDownUntil) return null;

  try {
    const [result] = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId))
      .limit(1);

    // Query succeeded — clear any previous failure state.
    dbDownUntil = 0;

    if (!result) return null;

    if (result.expiresAt < new Date()) {
      try {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
      } catch {
        // Expired-session cleanup is best-effort; it can retry next request.
      }
      return null;
    }

    return { id: result.userId, email: result.email, name: result.name };
  } catch (err) {
    // Trip the breaker and surface the outage at most once per interval.
    dbDownUntil = Date.now() + DB_COOLDOWN_MS;
    if (Date.now() - dbFailureLoggedAt >= DB_LOG_INTERVAL_MS) {
      dbFailureLoggedAt = Date.now();
      // warn (not error) so a down database degrades silently instead of
      // flooding the Next.js dev error overlay on every request.
      console.warn('[Auth] DB unavailable during session lookup; treating as logged out:', err);
    }
    return null;
  }
}
