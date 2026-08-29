import type { Metadata } from 'next';
import { DeepFeatures } from '@/sections/DeepFeatures';

export const metadata: Metadata = {
  title: 'Technical Activities — SID Managed Cloud',
};

export default function ActivitiesPage() {
  return <DeepFeatures />;
}
