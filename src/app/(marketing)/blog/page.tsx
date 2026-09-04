import type { Metadata } from 'next';
import { BlogPage } from '@/sections/BlogPage';

export const metadata: Metadata = {
  title: 'Blog & Resources — SID Managed Cloud Services',
  description: 'Engineering case studies on systems MarsLab has actually built — DPaaS, RenewalPro, OCR Smart Scan, and FCAE CORE.',
};

export default function Blog() {
  return <BlogPage />;
}
