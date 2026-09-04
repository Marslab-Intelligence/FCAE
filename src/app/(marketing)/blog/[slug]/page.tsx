import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { caseStudies, getCaseStudy } from '@/lib/case-studies';
import { CaseStudyDetail } from '@/sections/CaseStudyDetail';

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};

  return {
    title: `${study.name} — Engineering Case Study — SID Managed Cloud Services`,
    description: study.tagline,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return <CaseStudyDetail study={study} />;
}
