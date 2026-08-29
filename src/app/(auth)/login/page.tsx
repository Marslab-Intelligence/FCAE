import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInPage } from '@/components/ui/sign-in-flow-1';

export const metadata: Metadata = {
  title: 'Client Login — SID Managed Cloud',
};

export default function LoginRoute() {
  return (
    <Suspense>
      <SignInPage mode="login" />
    </Suspense>
  );
}
