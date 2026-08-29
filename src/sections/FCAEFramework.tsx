'use client';

import { motion } from 'framer-motion';
import { Server, TrendingUp, ShieldCheck, Rocket } from 'lucide-react';

const stages = [
  {
    stage: 'Operate',
    icon: Server,
    description: 'Keep my applications running without disruption',
    component: 'FCAE',
    fullForm: 'Fractional Cloud & Architecture Engineering',
    definition: 'Service Delivery Framework',
  },
  {
    stage: 'Optimize',
    icon: TrendingUp,
    description: 'Help me reduce costs and improve performance',
    component: 'OOGT',
    fullForm: 'Operate, Optimize, Govern and Transform',
    definition: 'Service Maturity Model',
  },
  {
    stage: 'Govern',
    icon: ShieldCheck,
    description: 'Help me reduce risk and improve security',
    component: 'CORE',
    fullForm: 'Cloud Operations & Reliability Engine',
    definition: 'Operational Intelligence & Reporting Engine',
  },
  {
    stage: 'Transform',
    icon: Rocket,
    description: 'Help me make better technology decisions for business growth',
    component: null,
    fullForm: null,
    definition: null,
  },
];

export function FCAEFramework() {
  return (
    <section className="stellar-section" aria-labelledby="fcae-framework-heading">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="stellar-eyebrow"
          >
            The Operating Model
          </motion.p>
          <h2
            id="fcae-framework-heading"
            className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight text-white"
          >
            The OOGT framework: Operate, Optimize, Govern, Transform
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/55 max-w-2xl leading-relaxed">
            Every engagement moves through the same service maturity model. Each stage layers on the next — later
            plans include everything from the stages before them.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((item, i) => (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="liquid-glass relative rounded-3xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-3xl font-semibold text-white/15">0{i + 1}</span>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-4.5 h-4.5 text-violet-300" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{item.stage}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
              {item.component && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">{item.component}</p>
                  <p className="mt-1 text-xs text-white/45">{item.fullForm}</p>
                  <p className="mt-0.5 text-xs text-white/35">{item.definition}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
