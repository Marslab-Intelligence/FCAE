'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Cloud, Cpu, DollarSign, Shield, Activity, Server, ArrowRight,
  CheckCircle2, Globe, GitBranch
} from 'lucide-react';

const services = [
  {
    id: 'cloud-ops',
    icon: Cloud,
    title: 'Cloud Operations',
    badge: 'Core Service',
    desc: 'Day-to-day cloud management so your team can focus on product, not infrastructure.',
    features: [
      'Infrastructure monitoring & alerting 24/7',
      'Incident response & resolution',
      'Change & release management',
      'Cloud health dashboards',
      'Resource lifecycle management',
      'Capacity planning & scaling',
    ],
    plans: ['Foundation', 'Care', 'Assure', 'Elite'],
    color: 'from-blue-500/15 to-indigo-500/10 border-blue-500/25',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'architecture',
    icon: Cpu,
    title: 'Cloud Architecture',
    badge: 'Design & Strategy',
    desc: 'Design scalable, resilient, cost-efficient cloud architectures for your business needs.',
    features: [
      'Well-Architected Framework reviews',
      'Multi-cloud & hybrid cloud design',
      'Landing zone implementation',
      'Microservices architecture',
      'Disaster recovery architecture',
      'Migration planning & execution',
    ],
    plans: ['Care', 'Assure', 'Elite'],
    color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/25',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'finops',
    icon: DollarSign,
    title: 'FinOps & Cost Optimization',
    badge: 'Cost Reduction',
    desc: 'Cut cloud waste, implement governance, and align cloud spending with business value.',
    features: [
      'Cost visibility & attribution',
      'Reserved instance optimization',
      'Resource rightsizing recommendations',
      'Savings plan analysis',
      'Chargeback & showback models',
      'Budget alerts & anomaly detection',
    ],
    plans: ['Care', 'Assure', 'Elite'],
    color: 'from-amber-500/15 to-orange-500/10 border-amber-500/25',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security Governance',
    badge: 'Compliance & Risk',
    desc: 'Strengthen your security posture, achieve compliance, and reduce organizational risk.',
    features: [
      'Cloud security posture management',
      'Compliance readiness (SOC2, ISO, PCI)',
      'IAM & privileged access management',
      'Security incident response',
      'Vulnerability management',
      'Data classification & protection',
    ],
    plans: ['Assure', 'Elite'],
    color: 'from-red-500/15 to-rose-500/10 border-red-500/25',
    iconBg: 'bg-red-500/20 text-red-400',
  },
  {
    id: 'continuity',
    icon: Activity,
    title: 'Business Continuity',
    badge: 'Resilience',
    desc: 'Protect your business from disruptions with DR planning, testing, and automated failover.',
    features: [
      'Disaster recovery planning',
      'RTO/RPO definition & testing',
      'Automated failover configuration',
      'Backup strategy & validation',
      'Business impact analysis',
      'Runbook creation & maintenance',
    ],
    plans: ['Assure', 'Elite'],
    color: 'from-purple-500/15 to-violet-500/10 border-purple-500/25',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'devops',
    icon: GitBranch,
    title: 'DevOps & Platform Engineering',
    badge: 'Developer Productivity',
    desc: 'Accelerate delivery with CI/CD pipelines, Kubernetes management, and platform automation.',
    features: [
      'Kubernetes & container management',
      'CI/CD pipeline design & management',
      'Infrastructure as Code (Terraform)',
      'Developer platform engineering',
      'GitOps workflow implementation',
      'Observability stack (Prometheus, Grafana)',
    ],
    plans: ['Care', 'Assure', 'Elite'],
    color: 'from-cyan-500/15 to-sky-500/10 border-cyan-500/25',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  },
];

const planColors: Record<string, string> = {
  Foundation: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Care: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Assure: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Elite: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function ServicesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full bg-linear-to-r from-accent/8 to-purple-600/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/55 mb-8">
            <Server className="w-4 h-4 text-accent" /> Service Catalog
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="font-display font-semibold text-fluid-hero tracking-tight leading-tight text-white mb-6">
            Everything your cloud needs, <span className="text-gradient-accent">managed for you</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
            From daily operations to strategic governance — we handle every layer of your cloud so you can focus on your business.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/plans" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all">
              View Plans <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-semibold hover:bg-white/8 transition-all">
              Talk to an Expert <Globe className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                id={service.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.15}
                className={`p-8 rounded-3xl border bg-linear-to-br transition-all hover:scale-[1.01] group ${service.color}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.iconBg}`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white/55">
                    {service.badge}
                  </span>
                </div>
                <h2 className="font-display font-semibold text-2xl text-white mb-3">{service.title}</h2>
                <p className="text-white/55 text-sm leading-relaxed mb-6">{service.desc}</p>

                <div className="space-y-2.5 mb-6">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-white/55">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <span className="text-xs text-white/45 font-medium">Available in:</span>
                  {service.plans.map((plan) => (
                    <span key={plan} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${planColors[plan]}`}>
                      {plan}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-y border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '99.98%', label: 'Average SLA Uptime' },
              { value: '<15 min', label: 'P1 Response (Elite)' },
              { value: '40%', label: 'Avg Cloud Cost Reduction' },
              { value: '200+', label: 'Enterprise Clients' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
              >
                <p className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-accent mb-2">{s.value}</p>
                <p className="text-sm text-white/55">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-y">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-linear-to-br from-accent/10 via-transparent to-purple-600/10 border border-accent/20"
          >
            <h2 className="font-display font-semibold text-fluid-h2 tracking-tight text-white mb-4">
              Not sure which services you need?
            </h2>
            <p className="text-white/55 mb-8">Our cloud experts will assess your current state and recommend the right combination of services.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)] transition-all">
              Request a Free Assessment <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
