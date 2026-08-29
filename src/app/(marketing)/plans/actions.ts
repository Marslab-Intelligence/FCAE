'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { savedPlans, planTierEnum } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

type Tier = (typeof planTierEnum.enumValues)[number];

export async function saveTierAction(tier: Tier, _formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?redirect=/plans');
  }

  await db
    .insert(savedPlans)
    .values({ userId: user.id, tier })
    .onConflictDoUpdate({
      target: savedPlans.userId,
      set: { tier, savedAt: new Date() },
    });

  revalidatePath('/plans');
  revalidatePath('/account');
}
