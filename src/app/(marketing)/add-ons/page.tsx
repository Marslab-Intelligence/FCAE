import type { Metadata } from 'next';
import { AddOnsPage } from '@/sections/AddOnsPage';

export const metadata: Metadata = {
  title: 'Add-On Services — SID Managed Cloud Services',
  description: 'Enhance your managed cloud plan with optional add-on services including security audits, compliance reports, and more.',
};

export default function AddOns() {
  return <AddOnsPage />;
}
