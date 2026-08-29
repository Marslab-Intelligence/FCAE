import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password — SID Managed Cloud',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
