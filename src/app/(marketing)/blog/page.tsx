import type { Metadata } from 'next';
import { BlogPage } from '@/sections/BlogPage';

export const metadata: Metadata = {
  title: 'Blog & Resources — SID Managed Cloud Services',
  description: 'Cloud insights, best practices, FinOps guides, and managed cloud thought leadership.',
};

export default function Blog() {
  return <BlogPage />;
}
