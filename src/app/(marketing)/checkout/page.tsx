import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { CheckoutFlow } from '@/sections/CheckoutFlow';

export const metadata: Metadata = {
  title: 'Checkout — SID Managed Cloud',
};

// Checkout creates a real `orders` row (see ./actions.ts), which requires a
// signed-in user — matches the lifecycle in AGENTS.md: /sign-in|/sign-up is
// the pre-payment identity you create to move toward paying.
export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in?redirect=/checkout');
  }

  return <CheckoutFlow />;
}
