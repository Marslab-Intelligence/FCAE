import type { Metadata } from 'next';
import { FAQsPage } from '@/sections/FAQsPage';

export const metadata: Metadata = {
  title: 'FAQs — SID Managed Cloud Services',
  description: 'Frequently asked questions about SID Managed Cloud services, plans, pricing, and support.',
};

export default function FAQs() {
  return <FAQsPage />;
}
