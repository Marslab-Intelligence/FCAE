import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignInPage } from '@/components/ui/sign-in-flow-1';

export const metadata: Metadata = {
  title: 'Sign Up — SID Managed Cloud',
};

export default function SignUpPage() {
  return (
    <Suspense>
      <SignInPage mode="sign-up" />
    </Suspense>
  );
}
