'use server';

import { z } from 'zod';
import { db } from '@/db/client';
import { orders } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

const orderSchema = z.object({
  planId: z.string().trim().min(1),
  amount: z.number().int().positive(),
  currency: z.string().trim().min(1).default('INR'),
});

export type SubmitOrderInput = z.input<typeof orderSchema>;
export type SubmitOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

/**
 * Records a real, DB-backed order for the signed-in user's current
 * checkout attempt. Razorpay isn't wired up yet (see AGENTS.md), so every
 * order is created with status 'pending' — there is no charge here, this
 * just makes "what I configured is what gets recorded" true end-to-end
 * instead of the checkout flow being entirely client-side theater.
 */
export async function submitOrderAction(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'You must be signed in to submit an order.' };
  }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid order details — please refresh and try again.' };
  }

  try {
    const [row] = await db
      .insert(orders)
      .values({
        userId: user.id,
        planId: parsed.data.planId,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        status: 'pending',
      })
      .returning({ id: orders.id });

    return { ok: true, orderId: row.id };
  } catch (err) {
    console.error('[Checkout] order insert failed:', err);
    return { ok: false, error: 'We could not save your order. Please try again.' };
  }
}
