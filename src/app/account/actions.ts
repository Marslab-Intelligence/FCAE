'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { savedPlans } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function removeSavedPlanAction() {
  const user = await getCurrentUser();
  if (!user) return;

  await db.delete(savedPlans).where(eq(savedPlans.userId, user.id));
  revalidatePath('/account');
  revalidatePath('/plans');
}
