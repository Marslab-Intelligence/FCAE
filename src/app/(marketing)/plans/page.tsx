import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { savedPlans } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { Pricing } from '@/sections/Pricing';
import { PlanComparisonMatrix } from '@/sections/PlanComparisonMatrix';

export const metadata: Metadata = {
  title: 'Plan Comparison — SID Managed Cloud',
};

export default async function PlansPage() {
  const user = await getCurrentUser();
  let savedTier: string | null = null;

  if (user) {
    const [saved] = await db.select().from(savedPlans).where(eq(savedPlans.userId, user.id)).limit(1);
    savedTier = saved?.tier ?? null;
  }

  return (
    <>
      <Pricing isSignedIn={!!user} savedTier={savedTier} />
      <PlanComparisonMatrix />
    </>
  );
}
