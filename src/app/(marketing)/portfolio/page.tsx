import type { Metadata } from 'next';
import { PortfolioPage } from '@/sections/PortfolioPage';

export const metadata: Metadata = {
  title: 'Portfolio & Case Studies — SID Managed Cloud Services',
  description: 'Real-world cloud transformation stories and outcomes from our enterprise clients.',
};

export default function Portfolio() {
  return <PortfolioPage />;
}
