'use client';

import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';

type Cell = boolean | string;
type Row = { label: string; values: [Cell, Cell, Cell, Cell] };

const PLAN_NAMES = ['Foundation', 'Care', 'Assure', 'Elite'];

const serviceAreaRows: Row[] = [
  { label: 'Reliable Cloud Operations', values: [true, true, true, true] },
  { label: 'Incident Assistance', values: [true, true, true, true] },
  { label: 'Cloud Cost Visibility', values: [true, true, true, true] },
  { label: 'Cloud Cost Optimization', values: [false, true, true, true] },
  { label: 'Performance Optimization', values: [false, true, true, true] },
  { label: 'Cloud Cost Governance', values: [false, false, true, true] },
  { label: 'Security Governance', values: [false, false, true, true] },
  { label: 'Business Continuity Planning', values: [false, false, true, true] },
  { label: 'Executive Reviews', values: [false, false, true, true] },
  { label: 'Compliance Readiness', values: [false, false, true, true] },
  { label: 'Dedicated Service Delivery Manager', values: [false, false, true, true] },
  { label: 'Strategic Technology Roadmap', values: [false, false, false, true] },
  { label: 'Technology Investment Alignment', values: [false, false, false, true] },
  { label: 'Executive Visibility', values: [false, false, false, true] },
  { label: 'Leadership Escalation Path', values: [false, false, false, true] },
  { label: 'Innovation & Modernization', values: [false, false, false, true] },
];

const supportRows: Row[] = [
  { label: 'Support Days', values: ['Monday to Friday', 'Monday to Friday', 'Monday to Saturday', 'Monday to Saturday'] },
  { label: 'Support Timings', values: ['9am to 6pm', '8am to 8pm', '8am to 11:59pm', 'Round the clock'] },
  { label: 'Emergency Incident Support (P1)', values: ['Up to 6 hrs/mo', 'Up to 8 hrs/mo', 'Up to 10 hrs/mo', 'Unlimited'] },
  { label: 'Fair Usage Requests / Month', values: ['Up to 15', 'Up to 30', 'Up to 50', 'Reasonable unlimited'] },
];

const coreCapabilityRows: Row[] = [
  { label: 'Availability Visibility', values: [true, true, true, true] },
  { label: 'Incident Visibility', values: [true, true, true, true] },
  { label: 'SLA Visibility', values: [true, true, true, true] },
  { label: 'Cloud Cost Visibility', values: [true, true, true, true] },
  { label: 'Cost Optimization Insights', values: [false, true, true, true] },
  { label: 'Performance Insights', values: [false, true, true, true] },
  { label: 'Security Visibility', values: [false, false, true, true] },
  { label: 'Governance Visibility', values: [false, false, true, true] },
  { label: 'Backup & DR Visibility', values: [false, false, true, true] },
  { label: 'Executive Visibility', values: [false, false, false, true] },
  { label: 'Technology Roadmap Visibility', values: [false, false, false, true] },
  { label: 'Innovation Visibility', values: [false, false, false, true] },
];

const coreDeliverableRows: Row[] = [
  { label: 'Monthly Service Review', values: [true, true, true, true] },
  { label: 'Operational Health Report', values: [true, true, true, true] },
  { label: 'Cost Report', values: [true, true, true, true] },
  { label: 'Optimization Report', values: [false, true, true, true] },
  { label: 'Governance Scorecard', values: [false, false, true, true] },
  { label: 'Security Summary', values: [false, false, true, true] },
  { label: 'Business Continuity Report', values: [false, false, true, true] },
  { label: 'Executive Dashboard', values: [false, false, false, true] },
  { label: 'Strategic Roadmap Review', values: [false, false, false, true] },
];

const oogtAlignment = [
  { stage: 'Operate', focus: 'Reliable Operations', pillar: 'Reliability', outcome: 'Operational Stability' },
  { stage: 'Optimize', focus: 'Cost & Performance', pillar: 'Cost Intelligence', outcome: 'Operational Excellence' },
  { stage: 'Govern', focus: 'Security & Continuity', pillar: 'Governance Intelligence', outcome: 'Risk Reduction' },
  { stage: 'Transform', focus: 'Innovation & Growth', pillar: 'Strategic Intelligence', outcome: 'Business Growth' },
];

function Cell({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
        <Check className="h-3.5 w-3.5 text-violet-300" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return <Minus className="h-4 w-4 text-white/20" strokeWidth={2} />;
  }
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
      {value}
    </span>
  );
}

function MatrixTable({ rows, firstColumnLabel }: { rows: Row[]; firstColumnLabel: string }) {
  return (
    <div className="liquid-glass overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-165 border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                {firstColumnLabel}
              </th>
              {PLAN_NAMES.map((name) => (
                <th key={name} className="px-4 py-4 text-center text-xs font-medium uppercase tracking-wider text-white/70">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white/[0.015]' : ''}>
                <td className="px-6 py-3.5 text-white/80">{row.label}</td>
                {row.values.map((value, idx) => (
                  <td key={idx} className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center">
                      <Cell value={value} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="stellar-eyebrow"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="mt-3 font-display text-2xl md:text-3xl font-semibold tracking-tight text-white"
      >
        {title}
      </motion.h2>
    </div>
  );
}

export function PlanComparisonMatrix() {
  return (
    <section className="stellar-section" aria-labelledby="plan-matrix-heading">
      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        <div>
          <SectionHeader eyebrow="Full Comparison" title="Every service area, plan by plan" />
          <MatrixTable rows={serviceAreaRows} firstColumnLabel="Service Area" />
        </div>

        <div>
          <SectionHeader eyebrow="Support & Fair Usage" title="Support windows and request limits" />
          <MatrixTable rows={supportRows} firstColumnLabel="Detail" />
        </div>

        <div>
          <SectionHeader eyebrow="CORE Intelligence" title="Cloud Operations & Reliability Engine" />
          <p className="-mt-6 mb-8 max-w-2xl text-sm text-white/55 leading-relaxed">
            CORE is the operational intelligence and reporting engine behind every plan — the visibility layer that
            turns raw telemetry into decisions.
          </p>
          <MatrixTable rows={coreCapabilityRows} firstColumnLabel="CORE Capability" />
        </div>

        <div>
          <SectionHeader eyebrow="CORE Deliverables" title="What lands in your inbox" />
          <MatrixTable rows={coreDeliverableRows} firstColumnLabel="Deliverable" />
        </div>

        <div>
          <SectionHeader eyebrow="CORE & OOGT Alignment" title="How CORE maps to the operating model" />
          <div className="liquid-glass overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-165 border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['OOGT Stage', 'FCAE Focus', 'CORE Pillar', 'Customer Outcome'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {oogtAlignment.map((row, i) => (
                    <tr key={row.stage} className={i % 2 === 0 ? 'bg-white/[0.015]' : ''}>
                      <td className="px-6 py-4 font-display font-semibold text-white">{row.stage}</td>
                      <td className="px-6 py-4 text-white/70">{row.focus}</td>
                      <td className="px-6 py-4 text-white/70">{row.pillar}</td>
                      <td className="px-6 py-4 text-white/70">{row.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
