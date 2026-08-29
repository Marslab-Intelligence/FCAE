import type { Metadata } from 'next';
import { IndustriesPage } from '@/sections/IndustriesPage';

export const metadata: Metadata = {
  title: 'Industries We Serve — SID Managed Cloud Services',
  description: 'Tailored cloud solutions for Healthcare, Finance, Retail, Manufacturing, and more industries.',
};

export default function Industries() {
  return <IndustriesPage />;
}
