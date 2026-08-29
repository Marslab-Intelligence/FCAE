import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInPage } from '@/components/ui/sign-in-flow-1';

export const metadata: Metadata = {
  title: 'Sign In — SID Managed Cloud',
};

export default function SignInRoute() {
  return (
    <Suspense>
      <SignInPage mode="sign-in" />
    </Suspense>
  );
}
