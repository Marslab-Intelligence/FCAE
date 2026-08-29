'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Minus, ShoppingCart, ArrowRight, Check, Sparkles, Shield, BarChart3, FileText, Users, Zap, Lock, Database, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/CurrencyProvider';

const addOns = [
  {
    id: 'security-audit',
    icon: Shield,
    title: 'Cloud Security Audit',
    desc: 'Comprehensive review of your security posture with a detailed remediation report and priority-ranked findings.',
    price: 75000,
    frequency: 'per audit',
    category: 'Security',
    features: ['200+ security checks', 'Remediation roadmap', 'Executive summary', 'Engineer follow-up call'],
    popular: true,
  },
  {
    id: 'compliance-report',
    icon: FileText,
    title: 'Compliance Report (SOC2/ISO)',
    desc: 'Audit-ready evidence collection and compliance gap assessment for SOC 2 or ISO 27001.',
    price: 125000,
    frequency: 'per assessment',
    category: 'Compliance',
    features: ['Gap analysis report', 'Evidence templates', 'Auditor liaison', 'Policy templates'],
  },
  {
    id: 'finops-dashboard',
    icon: BarChart3,
    title: 'Advanced FinOps Dashboard',
    desc: 'Real-time multi-account cloud cost analytics with chargeback/showback, forecasting, and anomaly alerts.',
    price: 25000,
    frequency: '/month',
    category: 'FinOps',
    features: ['Multi-account visibility', 'Budget alerts', 'Chargeback models', 'Savings recommendations'],
    popular: true,
  },
  {
    id: 'additional-account',
    icon: Database,
    title: 'Additional Cloud Account',
    desc: 'Extend managed services coverage to an additional AWS, Azure, or GCP account.',
    price: 15000,
    frequency: '/month per account',
    category: 'Infrastructure',
    features: ['Full monitoring coverage', 'Cost tracking', 'Security policies', 'Incident response'],
    quantityEnabled: true,
  },
  {
    id: 'dedicated-engineer',
    icon: Users,
    title: 'Dedicated Cloud Engineer',
    desc: 'A named, senior cloud engineer embedded with your team for 20 hours/month of hands-on work.',
    price: 85000,
    frequency: '/month',
    category: 'Engineering',
    features: ['20 hrs/month', 'Named engineer', 'Weekly sync call', 'Slack access'],
  },
  {
    id: 'dr-testing',
    icon: Zap,
    title: 'DR Test & Validation',
    desc: 'Full disaster recovery simulation with RTO/RPO measurement, gap analysis, and runbook update.',
    price: 50000,
    frequency: 'per test',
    category: 'Resilience',
    features: ['Live DR simulation', 'RTO/RPO measurement', 'Updated runbooks', 'Board-ready report'],
  },
  {
    id: 'waf-ddos',
    icon: Lock,
    title: 'WAF & DDoS Protection Setup',
    desc: 'Design, implement, and optimize WAF rules and DDoS mitigation for your web applications.',
    price: 45000,
    frequency: 'one-time setup',
    category: 'Security',
    features: ['WAF rule library', 'Rate limiting', 'Bot detection', 'Monitoring dashboard'],
  },
  {
    id: 'observability-stack',
    icon: Eye,
    title: 'Observability Stack Setup',
    desc: 'Deploy and configure Prometheus, Grafana, and alerting for full-stack observability.',
    price: 60000,
    frequency: 'one-time setup',
    category: 'Engineering',
    features: ['Prometheus setup', '20+ dashboards', 'Alert runbooks', 'On-call rotation'],
  },
];

const categoryColors: Record<string, string> = {
  Security: 'bg-red-500/15 text-red-300 border-red-500/30',
  Compliance: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  FinOps: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Infrastructure: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Engineering: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Resilience: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function AddOnsPage() {
  const { price } = useCurrency();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(addOns.map(a => a.category)))];

  const toggleAddon = (id: string, _quantityEnabled = false) => {
    setSelected(prev => {
      if (prev[id]) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const updateQty = (id: string, delta: number) => {
    setSelected(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedAddOns = addOns.filter(a => selected[a.id]);
  const total = selectedAddOns.reduce((sum, a) => sum + a.price * (selected[a.id] || 0), 0);
  const count = Object.values(selected).reduce((a, b) => a + b, 0);

  const filtered = activeCategory === 'All' ? addOns : addOns.filter(a => a.category === activeCategory);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/3 w-125 h-125 rounded-full bg-linear-to-br from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
            <Sparkles className="w-4 h-4 text-accent" /> Add-On Services
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6">
                Customize your <span className="text-gradient-accent">cloud package</span>
              </motion.h1>
              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-lg text-white/55 leading-relaxed">
                Bolt on specialized capabilities to your managed service plan. Select any combination of add-ons to meet your specific needs.
              </motion.p>
            </div>
            {count > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/30"
              >
                <h3 className="font-display font-semibold text-lg text-white mb-4">Selected Add-Ons ({count})</h3>
                <div className="space-y-2 mb-4">
                  {selectedAddOns.map(a => (
                    <div key={a.id} className="flex justify-between items-center text-sm">
                      <span className="text-white/55">{a.title} {selected[a.id] > 1 && `×${selected[a.id]}`}</span>
                      <span className="text-white font-medium">
                        {(a.price * (selected[a.id] || 0)).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center mb-4">
                  <span className="font-semibold text-white">Estimated Total</span>
                  <span className="font-display font-semibold text-2xl text-accent">
                    {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                  </span>
                </div>
                <Link href="/contact" className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-8px_rgba(168,85,247,0.6)] transition-all text-sm">
                  Request Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-y border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                  activeCategory === cat ? 'bg-accent/15 border-accent/40 text-accent' : 'bg-white/3 border-white/10 text-white/55 hover:border-white/20 hover:text-white'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons Grid */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((addon, i) => {
              const isSelected = !!selected[addon.id];
              const qty = selected[addon.id] || 0;
              return (
                <motion.div
                  key={addon.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i * 0.08}
                  className={cn(
                    'p-6 rounded-3xl border flex flex-col transition-all duration-300',
                    isSelected
                      ? 'bg-accent/8 border-accent/40 shadow-[0_0_30px_-8px_rgba(168,85,247,0.4)]'
                      : 'bg-white/3 border-white/10 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  {addon.popular && (
                    <div className="flex justify-end mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30">Popular</span>
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                    <addon.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border w-fit mb-3', categoryColors[addon.category])}>
                    {addon.category}
                  </span>
                  <h3 className="font-display font-semibold text-lg text-white mb-2 leading-snug">{addon.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed mb-4 flex-1">{addon.desc}</p>

                  <div className="space-y-1.5 mb-5">
                    {addon.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-xs text-white/55">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="font-display font-semibold text-xl text-white">{price(addon.price)}</p>
                        <p className="text-xs text-white/45">{addon.frequency}</p>
                      </div>
                      {addon.quantityEnabled && isSelected && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(addon.id, -1)} className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/15 transition-all">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-medium text-white w-5 text-center">{qty}</span>
                          <button onClick={() => updateQty(addon.id, 1)} className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/15 transition-all">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleAddon(addon.id, addon.quantityEnabled)}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                        isSelected
                          ? 'bg-accent/15 border-accent/40 text-accent hover:bg-accent/20'
                          : 'bg-white/5 border-white/15 text-white/55 hover:bg-white/8 hover:text-white hover:border-white/25'
                      )}
                    >
                      {isSelected ? <><Check className="w-4 h-4" /> Added</> : <><Plus className="w-4 h-4" /> Add to Package</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sticky Cart Footer */}
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-5 px-6 py-4 rounded-2xl bg-bg-elevated/95 backdrop-blur-2xl border border-accent/30 shadow-[0_8px_40px_-8px_rgba(168,85,247,0.5)]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-accent" />
              <span className="text-sm text-white/55">{count} add-on{count !== 1 && 's'} selected</span>
            </div>
            <div className="w-px h-5 bg-white/15" />
            <span className="font-display font-semibold text-accent">
              {total.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </span>
            <Link href="/contact" className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-glow transition-all shadow-[0_0_20px_-4px_rgba(168,85,247,0.7)]">
              Get Quote →
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
