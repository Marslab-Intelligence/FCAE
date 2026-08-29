/**
 * POST /api/crm/deal-won
 *
 * Isolation model: this route has no browser session and is never called
 * from the client — the caller is maiom-sales-engine's own server, hitting
 * FCAE directly the moment a Deal is marked WON (the point at which the CRM
 * promotes the linked Customer record to ACTIVE). There is no user to
 * authorize against; instead every request must carry a valid HMAC-SHA256
 * signature over the raw body (see verifySignature below), proving it
 * actually came from the CRM and the body wasn't tampered with in transit.
 * `data.clientEmail` in the payload is what ties the request back to an
 * FCAE user — it is looked up directly, there is no session to trust.
 *
 * Payload shape (per the maiom-sales-engine side, confirm if it drifts):
 *   {
 *     event: "DEAL_WON",
 *     title: string,
 *     message: string,
 *     data: {
 *       clientEmail: string,
 *       dealName: string,
 *       companyName: string,
 *       totalDealValue: string | number,
 *       ...other fields are ignored
 *     }
 *   }
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';

const SIGNATURE_HEADER = 'x-webhook-signature';

const dealWonPayloadSchema = z.object({
  event: z.literal('DEAL_WON'),
  title: z.string().optional(),
  message: z.string().optional(),
  data: z.object({
    clientEmail: z.string().trim().toLowerCase().email(),
    dealName: z.string().optional(),
    companyName: z.string().optional(),
    totalDealValue: z.union([z.string(), z.number()]).optional(),
  }),
});

/**
 * Signature = hex-encoded HMAC-SHA256 of the exact raw request body, keyed by
 * WEBHOOK_SIGNING_SECRET (shared with the CRM out of band, must match
 * exactly). Plain hex digest, no "sha256=" prefix — confirm this matches
 * what maiom-sales-engine actually sends before wiring the real secret in.
 */
function verifySignature(rawBody: string, providedSignature: string | null): boolean {
  const secret = process.env.WEBHOOK_SIGNING_SECRET;
  if (!secret || !providedSignature) return false;

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const providedBuf = Buffer.from(providedSignature, 'hex');
  if (expectedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(expectedBuf, providedBuf);
}

export async function POST(request: NextRequest) {
  // Read the raw body first — signing covers the exact bytes sent, so this
  // must happen before any parsing, and the payload must not be touched
  // until the signature is verified.
  const rawBody = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER);

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = dealWonPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
  }

  const { clientEmail, dealName, companyName, totalDealValue } = parsed.data.data;

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, clientEmail)).limit(1);

  if (!user) {
    // A deal was won for someone who never created an FCAE account (e.g. the
    // sales team closed a deal sourced entirely outside the website). Not an
    // error on the CRM's end — 200 so it isn't retried as a failed delivery.
    //
    // Judgment call: log this clearly rather than adding a reconciliation
    // table. This is expected to be rare (most won deals should trace back
    // to a website enquiry with a matching account), a table adds a
    // migration + UI for something that may never need one, and a
    // structured log line is enough to catch it in server logs / whatever
    // log aggregation is in place. Revisit with a real table if this turns
    // out to happen often enough that logs aren't sufficient.
    console.warn('[CRM webhook] DEAL_WON for an email with no FCAE account — orphaned win:', {
      clientEmail,
      dealName,
      companyName,
      totalDealValue,
    });
    return NextResponse.json({ ok: true, matched: false });
  }

  await db.update(users).set({ isActiveClient: true }).where(eq(users.id, user.id));

  console.log('[CRM webhook] DEAL_WON matched an FCAE account, isActiveClient set:', {
    userId: user.id,
    clientEmail,
    dealName,
    companyName,
    totalDealValue,
  });

  return NextResponse.json({ ok: true, matched: true });
}
