import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';

/**
 * STUB — not wired to a real trigger yet.
 *
 * Per AGENTS.md's lifecycle notes: FCAE never pushes an "onboarded" event to
 * maiom-sales-engine. Instead, the Deal -> Client transition happens on the
 * CRM side when sales marks a deal won, and (once the CRM's contract is
 * final) maiom-sales-engine is expected to call *this* endpoint to tell FCAE
 * "this email is now a won client."
 *
 * Nothing in maiom-sales-engine points at this route yet — the payload shape
 * below (just `email`) is a placeholder guess, not a confirmed contract. Treat
 * this as scaffolding: the auth pattern and the isActiveClient flip are real
 * and safe to keep, but do not consider this "live" until the CRM-side shape
 * is confirmed and CRM_WEBHOOK_SECRET is actually set somewhere real.
 *
 * Auth: a shared-secret header, the same pattern as the outbound
 * CRM_API_KEY (src/lib/crm.ts) but a separate secret/env var, since inbound
 * and outbound credentials shouldn't be the same value.
 */

const WEBHOOK_HEADER = 'x-crm-webhook-secret';

const payloadSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  // TODO(deal-api): confirm what else maiom-sales-engine actually sends
  // (deal id? won amount? plan/tier?) once the real contract exists — an
  // `orders` row could be inserted here instead of/alongside flipping
  // isActiveClient if amount/plan data is available.
});

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!secret) return false; // not configured — treat as disabled, not "trust everyone"

  const provided = request.headers.get(WEBHOOK_HEADER);
  if (!provided) return false;

  const secretBuf = Buffer.from(secret);
  const providedBuf = Buffer.from(provided);
  return secretBuf.length === providedBuf.length && timingSafeEqual(secretBuf, providedBuf);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    // Same response whether the secret is unset (route disabled) or wrong
    // (bad caller) — don't leak which case it is.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user) {
    // No FCAE account for this email yet — nothing to flip. Not an error:
    // the deal may have been won for someone who hasn't signed up here.
    return NextResponse.json({ ok: true, matched: false });
  }

  await db.update(users).set({ isActiveClient: true }).where(eq(users.id, user.id));

  return NextResponse.json({ ok: true, matched: true });
}
