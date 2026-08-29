import type { Metadata } from 'next';
import { Integrations } from '@/sections/Integrations';

export const metadata: Metadata = {
  title: 'Service Reviews — SID Managed Cloud',
};

export default function ReviewsPage() {
  return <Integrations />;
}
