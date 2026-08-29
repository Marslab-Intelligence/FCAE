import type { Metadata } from 'next';
import { AboutPage } from '@/sections/AboutPage';

export const metadata: Metadata = {
  title: 'About Us — SID Managed Cloud Services',
  description: 'Learn about SID Managed Cloud — our mission, values, leadership team, and commitment to cloud excellence for enterprises.',
};

export default function About() {
  return <AboutPage />;
}
