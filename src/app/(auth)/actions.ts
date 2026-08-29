'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { createSession, hashPassword, verifyPassword, setSessionCookie, clearSessionCookie } from '@/lib/auth';
import { adoptPendingPlan } from '@/lib/pending-plan';
import { checkAuthRateLimit, clearAuthAttempts, getClientIp, recordAuthAttempt } from '@/lib/rate-limit';

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export interface AuthActionState {
  error?: string;
}

export async function signUpAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { email, password } = parsed.data;
  const ip = await getClientIp();

  const { limited } = await checkAuthRateLimit(email, ip);
  if (limited) {
    return { error: 'Too many attempts. Please try again in a few minutes.' };
  }
  await recordAuthAttempt(email, ip);

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { error: 'An account with that email already exists' };
  }

  const hashedPassword = await hashPassword(password);
  const [user] = await db.insert(users).values({ email, hashedPassword }).returning();

  await adoptPendingPlan(user.id);
  const sessionId = await createSession(user.id);
  await setSessionCookie(sessionId);
  await clearAuthAttempts(email, ip);

  redirect('/account');
}

export async function signInAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }
  const { email, password } = parsed.data;
  const ip = await getClientIp();

  const { limited } = await checkAuthRateLimit(email, ip);
  if (limited) {
    return { error: 'Too many attempts. Please try again in a few minutes.' };
  }
  await recordAuthAttempt(email, ip);

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !user.hashedPassword) {
    return { error: 'Incorrect email or password' };
  }

  const valid = await verifyPassword(password, user.hashedPassword);
  if (!valid) {
    return { error: 'Incorrect email or password' };
  }

  await adoptPendingPlan(user.id);
  const sessionId = await createSession(user.id);
  await setSessionCookie(sessionId);
  await clearAuthAttempts(email, ip);

  redirect('/account');
}

export async function signOutAction() {
  await clearSessionCookie();
  redirect('/');
}
