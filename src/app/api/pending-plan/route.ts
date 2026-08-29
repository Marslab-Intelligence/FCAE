/**
 * Remembers the tier a logged-out visitor configured, just before they are sent
 * to sign up.
 *
 * This lives in a route handler rather than the lead server action on purpose:
 * setting a cookie inside a Server Action makes Next revalidate and stream the
 * entire page tree back, which stalls the redirect that should follow.
 */
import { NextRequest, NextResponse } from 'next/server';
import { rememberPendingPlan } from '@/lib/pending-plan';

export async function POST(req: NextRequest) {
  const { planId } = await req.json().catch(() => ({ planId: null }));
  await rememberPendingPlan(planId);
  return NextResponse.json({ ok: true });
}
