import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = {
  title: 'Profile & Settings — SID Managed Cloud',
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <ProfileForm user={user} />;
}
