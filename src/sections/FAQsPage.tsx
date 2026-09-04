'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = ['All', 'Plans & Pricing', 'Services', 'Support & SLA', 'Technical', 'Billing'];

const faqs = [
  {
    category: 'Plans & Pricing',
    q: 'What\'s the difference between the four service tiers?',
    a: 'Foundation (9/5) provides reliable cloud support and core incident assistance. Care (12/5) adds cost optimization and performance management. Assure (16/6) extends to security governance, compliance, and DR planning. Elite (24/6) provides unlimited support, a dedicated Service Delivery Manager, and strategic technology leadership through Quarterly Business Reviews.',
  },
  {
    category: 'Plans & Pricing',
    q: 'Is there a minimum contract term?',
    a: 'We offer both monthly and annual contracts. Annual contracts come with a 15% discount. There\'s no setup fee for any plan. You can upgrade between tiers at any time; downgrades take effect at the next renewal.',
  },
  {
    category: 'Plans & Pricing',
    q: 'Can I add services without changing my tier?',
    a: 'Yes. Our add-on services catalog lets you bolt on capabilities like security audits, compliance reports, additional cloud accounts, and specialized consulting engagements without changing your base tier.',
  },
  {
    category: 'Services',
    q: 'Which cloud providers do you support?',
    a: 'We are multi-cloud native and support AWS (Advanced Consulting Partner), Microsoft Azure (Expert MSP), and Google Cloud (Premier Partner). We also support hybrid and on-premises environments through our DevOps practice.',
  },
  {
    category: 'Services',
    q: 'Do you handle cloud migrations?',
    a: 'Yes. Cloud migration is part of our Cloud Architecture service, available in Care, Assure, and Elite tiers. We handle lift-and-shift, re-platforming, and cloud-native re-architecture depending on your goals and timeline.',
  },
  {
    category: 'Services',
    q: 'What monitoring tools do you use?',
    a: 'We use a combination of native cloud tools (AWS CloudWatch, Azure Monitor, GCP Operations Suite) along with third-party tools like Datadog, Prometheus, Grafana, and PagerDuty depending on your environment and preferences.',
  },
  {
    category: 'Support & SLA',
    q: 'What is your P1 incident response time?',
    a: 'P1 (Critical) response times are: Foundation — 1 Hour, Care — 30 Minutes, Assure — 15 Minutes, Elite — 15 Minutes with dedicated escalation. These are contractual SLA commitments, not targets.',
  },
  {
    category: 'Support & SLA',
    q: 'What happens if you miss an SLA?',
    a: 'If we miss a contractual SLA, you are entitled to service credits as defined in your agreement. Our track record shows 99.97% SLA compliance across all clients, but we take every miss seriously and conduct root cause analysis.',
  },
  {
    category: 'Support & SLA',
    q: 'How do I raise a support ticket?',
    a: 'After signing up, you get access to your client dashboard where you can raise tickets with severity classification. Tickets can also be raised via email, phone (for P1/P2 incidents), and through our mobile app. Elite clients have a dedicated Slack/Teams channel.',
  },
  {
    category: 'Technical',
    q: 'Do you need root/admin access to our cloud accounts?',
    a: 'We follow least-privilege access principles. We request only the permissions needed to perform managed operations. All access is federated through your identity provider where possible, and we maintain a full audit trail of all actions taken.',
  },
  {
    category: 'Technical',
    q: 'How do you handle compliance requirements like PCI-DSS or HIPAA?',
    a: 'Compliance readiness is part of the Assure and Elite tiers. We conduct gap assessments, implement required controls, generate evidence for auditors, and maintain continuous compliance monitoring. We have worked with clients achieving PCI-DSS, HIPAA, SOC 2, and ISO 27001 compliance.',
  },
  {
    category: 'Billing',
    q: 'How is billing handled for cloud consumption?',
    a: 'Your cloud provider bills you directly for compute, storage, and other consumption. Our managed service fee is a separate invoice for the operational services we provide. We can consolidate billing reporting if required.',
  },
  {
    category: 'Billing',
    q: 'What payment methods do you accept?',
    a: 'We accept bank transfers (NEFT/RTGS/IMPS), corporate credit cards, and UPI for domestic clients. International clients can pay via wire transfer or corporate cards. GST invoice provided for all transactions.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as const } }),
};

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={index}
      className={cn(
        'rounded-2xl border transition-all duration-300',
        open ? 'bg-white/6 border-accent/30' : 'bg-white/3 border-white/10 hover:border-white/20'
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group cursor-pointer"
        aria-expanded={open}
      >
        <span className={cn('font-medium text-sm md:text-base leading-relaxed text-white transition-colors', open && 'font-semibold')}>{faq.q}</span>
        <ChevronDown className={cn('w-5 h-5 shrink-0 text-white/75 transition-transform duration-300 group-hover:text-white', open && 'rotate-180 text-accent')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-sm text-white/85 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-linear-to-r from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/15 text-sm font-medium text-white/90 mb-8">
            <HelpCircle className="w-4 h-4 text-accent" /> Frequently Asked Questions
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6">
            Questions? <span className="text-gradient-accent">We have answers.</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-lg text-white/80 leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-y border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer',
                  activeCategory === cat
                    ? 'bg-accent/20 border-accent/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                    : 'bg-white/5 border-white/15 text-white/90 hover:border-white/30 hover:text-white hover:bg-white/10'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="section-y">
        <div className="max-w-3xl mx-auto px-6 space-y-3">
          {filtered.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>
      </section>

      {/* Still have questions? */}
      <section className="section-y border-t border-white/8">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20"
          >
            <MessageCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="font-display font-semibold text-3xl text-white mb-3">Still have questions?</h2>
            <p className="text-white/80 mb-8">Our cloud experts are available to answer your specific requirements and help you find the right plan.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-8px_rgba(168,85,247,0.6)] transition-all">
                Talk to an Expert <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:hello@sidcloud.com" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold hover:bg-white/8 transition-all">
                Email Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
