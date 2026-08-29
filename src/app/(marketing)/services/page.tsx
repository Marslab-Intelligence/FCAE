import type { Metadata } from 'next';
import { ServicesPage } from '@/sections/ServicesPage';

export const metadata: Metadata = {
  title: 'Services — SID Managed Cloud Services',
  description: 'Explore our comprehensive managed cloud services: Cloud Operations, FinOps, Security Governance, DevOps, and more.',
};

export default function Services() {
  return <ServicesPage />;
}
