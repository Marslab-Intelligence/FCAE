'use server';

import { eq, and, gt } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db/client';
import { users, otpTokens } from '@/db/schema';
import { createSession, setSessionCookie } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/mail';
import { adoptPendingPlan } from '@/lib/pending-plan';

const OTP_TTL_MS = 10 * 60 * 1000;   // 10 minutes
const MAX_ATTEMPTS = 5;

export interface OtpActionState {
  error?: string;
  success?: boolean;
  email?: string;
}

/** Step 1 — generate & "send" a 6-digit OTP for the given email. */
export async function sendOtpAction(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const parsed = z.string().email('Enter a valid email address').safeParse(formData.get('email'));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid email' };
  }
  const email = parsed.data.toLowerCase();

  try {
    // Invalidate any existing tokens for this email
    await db.delete(otpTokens).where(eq(otpTokens.email, email));

    // Generate a secure 6-digit code
    const code = String(Math.floor(100_000 + Math.random() * 900_000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await db.insert(otpTokens).values({ email, code, expiresAt });

    await sendOtpEmail(email, code);
  } catch (err) {
    console.error('OTP Action failure:', err);
    return {
      error: 'Failed to send verification code. Please try again in a few moments.',
      email,
    };
  }

  return { success: true, email };
}

/** Step 2 — verify the OTP, upsert user, create session. */
export async function verifyOtpAction(
  _prevState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  const email = String(formData.get('email') ?? '').toLowerCase();
  const code  = String(formData.get('otp')   ?? '').trim();

  if (!email || !code) return { error: 'Missing email or code', email };

  try {
    const now = new Date();
    const [token] = await db
      .select()
      .from(otpTokens)
      .where(and(eq(otpTokens.email, email), gt(otpTokens.expiresAt, now)))
      .limit(1);

    if (!token) {
      return { error: 'Code expired or not found. Request a new one.', email };
    }

    if (token.attempts >= MAX_ATTEMPTS) {
      await db.delete(otpTokens).where(eq(otpTokens.id, token.id));
      return { error: 'Too many attempts. Please request a new code.', email };
    }

    if (token.code !== code) {
      await db
        .update(otpTokens)
        .set({ attempts: token.attempts + 1 })
        .where(eq(otpTokens.id, token.id));
      const remaining = MAX_ATTEMPTS - token.attempts - 1;
      return { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, email };
    }

    // Code matches — clean up and sign in
    await db.delete(otpTokens).where(eq(otpTokens.id, token.id));

    // Upsert user
    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      [user] = await db.insert(users).values({ email }).returning();
    }

    await adoptPendingPlan(user.id);
    const sessionId = await createSession(user.id);
    await setSessionCookie(sessionId);
  } catch (err) {
    console.error('Verify OTP failure:', err);
    return {
      error: 'Unable to verify code at this time. Please try again in a few moments.',
      email,
    };
  }

  redirect('/account');
}
