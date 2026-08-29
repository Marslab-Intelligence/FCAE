import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { PackageBuilder } from '@/sections/PackageBuilder';

export const metadata: Metadata = {
  title: 'Build Your Package — SID Managed Cloud',
  description: 'Start with a base tier and drag in the exact managed-cloud services you need to build a custom package.',
};

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const [{ plan }, user] = await Promise.all([searchParams, getCurrentUser()]);

  return <PackageBuilder initialPlan={plan ?? null} isSignedIn={!!user} />;
}
