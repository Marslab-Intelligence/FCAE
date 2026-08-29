'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { tickets } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createZohoDeskTicket, isZohoDeskConfigured } from '@/lib/zoho-desk';

const optional = z.string().trim().max(20000).optional().transform((v) => (v ? v : null));

const ticketSchema = z.object({
  department: z.string().trim().min(1, 'Department is required'),
  requestType: z.string().trim().min(1, 'Request type is required'),
  category: z.string().trim().min(1, 'Ticket category is required'),
  subCategory: optional,
  taskName: optional,
  requirements: z.string().trim().min(1, 'Requirements are required').max(5000),
  subject: z.string().trim().min(1, 'Subject is required').max(500),
  description: optional,
  onBehalfOfCustomer: z.boolean().optional().default(false),
  agentName: optional,
  agentEmail: optional,
})
  // Zoho marks these optional on the layout, but they are the whole point of
  // the checkbox — without them there is no record of who raised the ticket.
  .superRefine((v, ctx) => {
    if (!v.onBehalfOfCustomer) return;
    if (!v.agentName) {
      ctx.addIssue({ code: 'custom', path: ['agentName'], message: 'Agent name is required' });
    }
    if (!v.agentEmail) {
      ctx.addIssue({ code: 'custom', path: ['agentEmail'], message: 'Agent email is required' });
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.agentEmail)) {
      ctx.addIssue({ code: 'custom', path: ['agentEmail'], message: 'Enter a valid agent email' });
    }
  });

export type TicketInput = z.input<typeof ticketSchema>;

export type TicketResult =
  | { ok: true; id: string; ticketNumber: string | null }
  | { ok: false; fieldErrors: Record<string, string>; message?: string };

export async function submitTicketAction(input: TicketInput): Promise<TicketResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, fieldErrors: {}, message: 'Please sign in to raise a ticket.' };
  }

  const parsed = ticketSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  try {
    const [row] = await db
      .insert(tickets)
      .values({ ...parsed.data, userId: user.id })
      .returning({ id: tickets.id });

    // The ticket is recorded here first; pushing it to Zoho Desk is
    // best-effort so a Desk outage never loses a client's request.
    let ticketNumber: string | null = null;
    if (isZohoDeskConfigured()) {
      const result = await createZohoDeskTicket({
        ...parsed.data,
        contactEmail: user.email,
        contactName: user.name ?? user.email,
      });

      await db
        .update(tickets)
        .set(
          result.ok
            ? { zohoTicketId: result.ticketId, zohoTicketNumber: result.ticketNumber, zohoSyncedAt: new Date(), zohoSyncError: null }
            : { zohoSyncError: result.error },
        )
        .where(eq(tickets.id, row.id))
        .catch((e) => console.error('[Tickets] could not record Desk sync state:', e));

      if (result.ok) ticketNumber = result.ticketNumber;
      else console.error('[Tickets] Zoho Desk hand-off failed:', result.error);
    }

    return { ok: true, id: row.id, ticketNumber };
  } catch (err) {
    console.error('[Tickets] insert failed:', err);
    return { ok: false, fieldErrors: {}, message: 'We could not raise your ticket. Please try again.' };
  }
}
