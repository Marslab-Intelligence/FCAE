'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const posts = [
  {
    slug: 'finops-maturity-model',
    title: 'The FinOps Maturity Model: From Cost Chaos to Strategic Control',
    excerpt: 'Most organizations start their FinOps journey with no visibility into cloud spend. Here\'s how to move from reactive cost management to proactive financial governance in three phases.',
    category: 'FinOps',
    readTime: '8 min read',
    date: 'Jan 15, 2025',
    tag: 'Featured',
    color: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20',
  },
  {
    slug: 'kubernetes-cost-reduction',
    title: '7 Kubernetes Cost Reduction Techniques That Actually Work',
    excerpt: 'Kubernetes can be notoriously expensive if not configured correctly. We analyzed 50 client clusters and found these 7 optimizations consistently deliver 30-50% cost reductions.',
    category: 'DevOps',
    readTime: '6 min read',
    date: 'Jan 8, 2025',
    tag: 'Technical',
    color: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20',
  },
  {
    slug: 'cloud-security-posture-2025',
    title: "Cloud Security Posture Management in 2025: What's Changed",
    excerpt: 'The threat landscape has evolved dramatically. Here\'s what enterprises need to know about CSPM in 2025, including new attack vectors and the tools best equipped to defend against them.',
    category: 'Security',
    readTime: '10 min read',
    date: 'Dec 28, 2024',
    tag: 'Security',
    color: 'from-red-500/10 to-rose-500/5 border-red-500/20',
  },
  {
    slug: 'aws-reserved-instances-guide',
    title: 'The Complete Guide to AWS Reserved Instances & Savings Plans in 2025',
    excerpt: 'Reserved instances and savings plans remain the single highest-ROI cloud optimization technique. This guide explains every option and when to choose each one.',
    category: 'FinOps',
    readTime: '12 min read',
    date: 'Dec 20, 2024',
    tag: 'Guide',
    color: 'from-amber-500/10 to-orange-500/5 border-amber-500/20',
  },
  {
    slug: 'hipaa-compliance-checklist',
    title: 'HIPAA Compliance on AWS: A Practical Checklist for 2025',
    excerpt: 'Achieving HIPAA compliance on AWS doesn\'t have to be overwhelming. This actionable checklist covers every control you need to implement, with links to relevant AWS documentation.',
    category: 'Compliance',
    readTime: '9 min read',
    date: 'Dec 12, 2024',
    tag: 'Compliance',
    color: 'from-purple-500/10 to-violet-500/5 border-purple-500/20',
  },
  {
    slug: 'multi-cloud-strategy',
    title: 'When Does Multi-Cloud Actually Make Sense? A CTO\'s Framework',
    excerpt: 'Multi-cloud is often recommended without clear business justification. Here\'s a framework for deciding whether multi-cloud is right for your organization or just adding complexity.',
    category: 'Strategy',
    readTime: '7 min read',
    date: 'Dec 5, 2024',
    tag: 'Strategy',
    color: 'from-cyan-500/10 to-sky-500/5 border-cyan-500/20',
  },
];

const tagColors: Record<string, string> = {
  Featured: 'bg-accent/15 text-accent border-accent/30',
  Technical: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Security: 'bg-red-500/15 text-red-300 border-red-500/30',
  Guide: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Compliance: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Strategy: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function BlogPage() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-125 h-125 rounded-full bg-linear-to-br from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
            <BookOpen className="w-4 h-4 text-accent" /> Blog & Resources
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6 max-w-3xl">
            Cloud insights for <span className="text-gradient-accent">enterprise teams</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-xl text-white/55 max-w-2xl leading-relaxed">
            Practical guides, case studies, and best practices from our cloud engineering team.
          </motion.p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn('p-8 md:p-12 rounded-3xl border bg-linear-to-br transition-all hover:scale-[1.005]', featured.color)}
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border', tagColors[featured.tag])}>{featured.tag}</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-white/55 border border-white/15">{featured.category}</span>
            </div>
            <h2 className="font-display font-semibold text-3xl md:text-4xl text-white mb-4 max-w-3xl leading-tight">{featured.title}</h2>
            <p className="text-white/55 leading-relaxed mb-6 max-w-2xl">{featured.excerpt}</p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-sm text-white/45">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featured.readTime}</span>
                <span>{featured.date}</span>
              </div>
              <Link href={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/20 transition-all">
                Read Article <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className={cn('p-6 rounded-3xl border bg-linear-to-br transition-all hover:scale-[1.02] group flex flex-col', post.color)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', tagColors[post.tag])}>{post.tag}</span>
                  <span className="text-xs text-white/45">{post.category}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-white leading-snug mb-3 flex-1">{post.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-xs text-white/45">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                    <span>{post.date}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="text-accent text-xs font-medium hover:text-accent-glow transition-colors flex items-center gap-1">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-y border-t border-white/8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20"
          >
            <h2 className="font-display font-semibold text-3xl text-white mb-3">Stay ahead of the cloud curve</h2>
            <p className="text-white/55 mb-8">Monthly newsletter with actionable cloud insights, cost tips, and security updates.</p>
            <form onSubmit={e => e.preventDefault()} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@company.com"
                className="input-field flex-1 rounded-xl"
              />
              <button type="submit" className="px-5 py-3 rounded-xl bg-accent/15 border border-accent/30 text-accent text-sm font-semibold hover:bg-accent/20 transition-all whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
