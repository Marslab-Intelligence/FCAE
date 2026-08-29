import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { Dashboard } from '@/components/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — SID Managed Cloud',
};

/**
 * The dashboard markup lives in `@/components/dashboard` rather than inline
 * here — it used to exist in both places, so a change to one silently left the
 * other showing different numbers.
 */
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return <Dashboard />;
}
