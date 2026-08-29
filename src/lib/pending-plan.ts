import 'server-only';
import { cookies } from 'next/headers';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { leads, savedPlans, users, planTierEnum } from '@/db/schema';

/**
 * Carries a package choice across the sign-up boundary.
 *
 * A visitor configures a tier in the builder while logged out, so there is no
 * account to attach it to yet. The choice is remembered here and claimed the
 * moment they authenticate, which is what makes it show up on "My Package &
 * Tier" instead of the empty state.
 */

const COOKIE = 'sid_pending_plan';
const COOKIE_MAX_AGE = 60 * 60; // an hour is plenty to finish signing up

type Tier = (typeof planTierEnum.enumValues)[number];

const isTier = (v: string | null | undefined): v is Tier =>
  !!v && (planTierEnum.enumValues as readonly string[]).includes(v);

/** Called when a logged-out visitor requests a quote for a tier. */
export async function rememberPendingPlan(tier: string | null | undefined) {
  if (!isTier(tier)) return;
  const store = await cookies();
  store.set(COOKIE, tier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

async function clearPendingPlan() {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Attach a remembered package to the account that just authenticated.
 *
 * Never overwrites a plan the client already has — an existing choice is
 * theirs, and a stale cookie must not silently move them onto another tier.
 * Falls back to the tier on their most recent quote request, so signing up
 * still works if the cookie was dropped (different browser, cleared storage).
 */
export async function adoptPendingPlan(userId: string) {
  try {
    const [existing] = await db
      .select({ id: savedPlans.id })
      .from(savedPlans)
      .where(eq(savedPlans.userId, userId))
      .limit(1);

    if (existing) {
      await clearPendingPlan();
      return;
    }

    const store = await cookies();
    const fromCookie = store.get(COOKIE)?.value;
    let tier: Tier | null = isTier(fromCookie) ? fromCookie : null;

    if (!tier) {
      const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user) {
        const [lead] = await db
          .select({ planId: leads.planId })
          .from(leads)
          .where(eq(leads.email, user.email))
          .orderBy(desc(leads.createdAt))
          .limit(1);

        if (isTier(lead?.planId)) tier = lead.planId;
      }
    }

    if (!tier) return;

    await db.insert(savedPlans).values({ userId, tier }).onConflictDoNothing();
    await clearPendingPlan();
  } catch (err) {
    // Never block sign-in over this — the client can pick a plan from /plans.
    console.error('[PendingPlan] could not attach package to account:', err);
  }
}
