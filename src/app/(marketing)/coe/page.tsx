import type { Metadata } from 'next';
import { Showcase } from '@/sections/Showcase';

export const metadata: Metadata = {
  title: 'Center of Excellence — SID Managed Cloud',
};

export default function CoePage() {
  return <Showcase />;
}
