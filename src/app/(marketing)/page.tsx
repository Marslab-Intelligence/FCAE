import { Hero } from '@/sections/Hero';
import { LivingCloudSection } from '@/sections/LivingCloudSection';
import { CloudPillarsShowcase } from '@/sections/CloudPillarsShowcase';
import { Features } from '@/sections/Features';
import { InteractiveDemo } from '@/sections/InteractiveDemo';
import { Pricing } from '@/sections/Pricing';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db/client';
import { savedPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { HomeTestimonialsSection } from '@/sections/HomeTestimonialsSection';

import { PlanVideoShowcase } from '@/sections/PlanVideoShowcase';
import { PlanInteractiveShowcase } from '@/sections/PlanInteractiveShowcase';

export default async function HomePage() {
  const user = await getCurrentUser();
  let savedTier: string | null = null;
  if (user) {
    const [saved] = await db.select().from(savedPlans).where(eq(savedPlans.userId, user.id)).limit(1);
    savedTier = saved?.tier ?? null;
  }

  return (
    <>
      <Hero />
      <LivingCloudSection />
      <CloudPillarsShowcase />
      <Features />
      <InteractiveDemo />
      <Pricing isSignedIn={!!user} savedTier={savedTier} />
      <PlanInteractiveShowcase />
      <PlanVideoShowcase />
      <HomeTestimonialsSection />
    </>
  );
}

