'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { leads } from '@/db/schema';
import { pushDealToCrm, toCrmIndustry, isCrmConfigured } from '@/lib/crm';

/** Trim, then treat an empty string as "not provided". */
const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v ? v : null));

const leadSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(200),
  website: optionalText,
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(200),
  phone: optionalText,
  industry: optionalText,

  country: optionalText,
  state: optionalText,
  postalCode: optionalText,

  customerRequirement: optionalText,
  // Comes off a number input, so it arrives as a string (or empty).
  customerBudget: z
    .string()
    .trim()
    .optional()
    .transform((v) => {
      if (!v) return null;
      const n = Number(v.replace(/[^0-9.]/g, ''));
      return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
    }),

  planId: optionalText,
  selectedServices: optionalText,
});

export type LeadInput = z.input<typeof leadSchema>;

export type LeadResult =
  | { ok: true; id: string }
  | { ok: false; fieldErrors: Record<string, string>; message?: string };

/**
 * Persists a quote request from the package builder. Runs before the visitor
 * has an account, so it deliberately requires no session — the email is what
 * links the lead to the account they create next.
 */
export async function submitLeadAction(input: LeadInput): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  try {
    const [row] = await db.insert(leads).values(parsed.data).returning({ id: leads.id });

    // Push into the sales engine as a Deal so a salesperson can pick it up.
    // This is deliberately best-effort: the client has already given us
    // their details and must not see an error because the CRM is down. The
    // outcome is recorded on the row so a failed hand-off can be retried
    // later. The row itself stays in the local `leads` table (the pre-CRM
    // capture step) — it's only a "Deal" once it's on the CRM side.
    if (isCrmConfigured()) {
      const d = parsed.data;
      const result = await pushDealToCrm({
        companyName: d.companyName,
        website: d.website,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        state: d.state,
        country: d.country,
        zipCode: d.postalCode,
        industry: toCrmIndustry(d.industry),
        industryLabel: d.industry,
        dealSource: 'WEBSITE',
        customerRequirement: d.customerRequirement,
        customerBudget: d.customerBudget,
        planId: d.planId,
        selectedServices: d.selectedServices,
      });

      await db
        .update(leads)
        .set(
          result.ok
            ? { crmLeadId: result.crmDealId || 'synced', crmSyncedAt: new Date(), crmSyncError: null }
            : { crmSyncError: result.error },
        )
        .where(eq(leads.id, row.id))
        .catch((e) => console.error('[Leads] could not record CRM sync state:', e));

      if (!result.ok) console.error('[Leads] CRM Deal hand-off failed:', result.error);
    }

    return { ok: true, id: row.id };
  } catch (err) {
    console.error('[Leads] insert failed:', err);
    return {
      ok: false,
      fieldErrors: {},
      message: 'We could not save your details. Please try again.',
    };
  }
}
