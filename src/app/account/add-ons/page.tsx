import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { savedPlans } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import type { PlanId } from '@/lib/package-catalog';
import { AddOnsCatalog } from './AddOnsCatalog';

export const metadata: Metadata = {
  title: 'Add-On Services — SID Managed Cloud',
};

export default async function AccountAddOnsPage() {
  const user = await getCurrentUser();

  // Which services are already covered depends on the tier the client chose.
  let planId: PlanId | null = null;
  if (user) {
    const [saved] = await db
      .select({ tier: savedPlans.tier })
      .from(savedPlans)
      .where(eq(savedPlans.userId, user.id))
      .limit(1);
    planId = saved?.tier ?? null;
  }

  return <AddOnsCatalog planId={planId} />;
}
