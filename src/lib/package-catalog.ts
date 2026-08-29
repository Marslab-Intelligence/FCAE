import { Server, BarChart3, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';

/**
 * Single source of truth for the plan tiers + add-on service catalog used by
 * the package builder (/build). Base plan pricing/features are mirrored in
 * src/sections/Pricing.tsx card visuals — keep the numbers in sync.
 */

export type PlanId = 'foundation' | 'care' | 'assure' | 'elite';

export interface BasePlan {
  id: PlanId;
  name: string;
  category: string;
  tagline: string;
  icon: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  recommended?: boolean;
  accentText: string;
  glow: string;
  chipBg: string;
}

export const basePlans: BasePlan[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    category: 'Entry-level support',
    tagline: 'Reliable cloud support and access to expertise',
    icon: '🛡️',
    priceMonthly: 49000,
    priceYearly: 39000,
    features: [
      '9/5 support window (9am–6pm)',
      'Up to 6 hrs P1 response/mo',
      'Reliable cloud operations',
      'Incident assistance',
      'Cloud cost visibility',
    ],
    accentText: 'text-blue-400',
    glow: 'rgba(59,130,246,0.5)',
    chipBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  },
  {
    id: 'care',
    name: 'Care',
    category: 'Cost & performance',
    tagline: 'Operational excellence & cloud cost optimization',
    icon: '⚡',
    priceMonthly: 99000,
    priceYearly: 79000,
    features: [
      '12/5 support window (8am–8pm)',
      'Up to 8 hrs P1 response/mo',
      'Everything in Foundation',
      'Cloud cost optimization',
      'Performance optimization',
    ],
    accentText: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.5)',
    chipBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  },
  {
    id: 'assure',
    name: 'Assure',
    category: 'Governance & security',
    tagline: 'Governance, security & risk reduction',
    icon: '★',
    priceMonthly: 179000,
    priceYearly: 149000,
    recommended: true,
    features: [
      '16/6 support (8am–11:59pm Mon–Sat)',
      'Up to 10 hrs P1 response/mo',
      'Everything in Care',
      'Security governance',
      'Compliance readiness',
      'Dedicated SDM',
      'Executive reviews',
    ],
    accentText: 'text-amber-400',
    glow: 'rgba(245,158,11,0.55)',
    chipBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  },
  {
    id: 'elite',
    name: 'Elite',
    category: 'Strategic innovation',
    tagline: 'Strategic leadership & executive accountability',
    icon: '👑',
    priceMonthly: 299000,
    priceYearly: 249000,
    features: [
      '24/6 round-the-clock (Mon–Sat)',
      'Unlimited P1 incident support',
      'Everything in Assure',
      'Strategic tech roadmap',
      'Innovation & modernization',
      'Leadership escalation path',
    ],
    accentText: 'text-purple-400',
    glow: 'rgba(168,85,247,0.5)',
    chipBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
  },
];

export const getPlan = (id: string | undefined | null): BasePlan =>
  basePlans.find((p) => p.id === id) ?? basePlans[0];

export interface AddOn {
  id: string;
  name: string;
  desc: string;
  price: number;
  categoryId: string;
  categoryLabel: string;
}

export interface AddOnCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  items: { id: string; name: string; desc: string; price: number }[];
}

/**
 * The 15 service areas SID delivers, grouped by the plan tier that unlocks
 * them. Names and tier placement mirror `serviceAreaRows` in
 * src/sections/PlanComparisonMatrix.tsx — keep the two in sync.
 *
 * PRICING PENDING — every `price` below is a 0 placeholder, which renders as
 * "TBD" and contributes nothing to the quote total. Replace each 0 with the
 * real ₹/month figure; no other change is needed.
 */
export const addOnCategories: AddOnCategory[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    icon: Server,
    color: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    items: [
      { id: 'reliable-ops', name: 'Reliable Cloud Operations', desc: 'Monitoring across infrastructure, applications & backups', price: 0 },
      { id: 'incident-assist', name: 'Incident Assistance', desc: 'Triage, response & root-cause coordination for P1 incidents', price: 0 },
      { id: 'cost-visibility', name: 'Cloud Cost Visibility', desc: 'Billing analysis, monthly cost reporting & budget tracking', price: 0 },
    ],
  },
  {
    id: 'care',
    label: 'Care',
    icon: BarChart3,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    items: [
      { id: 'cost-optimization', name: 'Cloud Cost Optimization', desc: 'Rightsizing, savings plans & continuous waste elimination', price: 0 },
      { id: 'perf-optimization', name: 'Performance Optimization', desc: 'Capacity planning & workload tuning for latency and throughput', price: 0 },
    ],
  },
  {
    id: 'assure',
    label: 'Assure',
    icon: ShieldCheck,
    color: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    items: [
      { id: 'cloud-governance', name: 'Cloud Governance', desc: 'Cloud best-practice assessments & governance reviews', price: 0 },
      { id: 'security-governance', name: 'Security Governance', desc: 'Vulnerability reviews, IAM hygiene & posture management', price: 0 },
      { id: 'continuity-planning', name: 'Business Continuity Planning', desc: 'Backup validation, DR readiness reviews & recovery planning', price: 0 },
      { id: 'executive-reviews', name: 'Executive Reviews', desc: 'Structured service performance & risk reviews with leadership', price: 0 },
      { id: 'compliance-readiness', name: 'Compliance Readiness', desc: 'Compliance gap assessments & audit evidence preparation', price: 0 },
    ],
  },
  {
    id: 'elite',
    label: 'Elite',
    icon: Zap,
    color: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    items: [
      { id: 'tech-roadmap', name: 'Strategic Technology Roadmap', desc: 'Cloud strategy, modernization plans & architecture evolution', price: 0 },
      { id: 'investment-alignment', name: 'Technology Investment Alignment', desc: 'Semi-annual review aligning technology spend with business goals', price: 0 },
      { id: 'executive-visibility', name: 'Executive Visibility', desc: 'Quarterly business reviews on outcomes & business impact', price: 0 },
      { id: 'escalation-path', name: 'Leadership Escalation Path', desc: 'Direct access to SID senior management for critical concerns', price: 0 },
      { id: 'innovation', name: 'Innovation & Modernization', desc: 'Modernization opportunities & emerging technology adoption', price: 0 },
    ],
  },
];

/** Flattened list of every catalog add-on, tagged with its category. */
export const allAddOns: AddOn[] = addOnCategories.flatMap((cat) =>
  cat.items.map((item) => ({
    ...item,
    categoryId: cat.id,
    categoryLabel: cat.label,
  }))
);

/**
 * Support commitments per tier. Mirrors the `supportRows` table in
 * src/sections/PlanComparisonMatrix.tsx — keep the two in sync.
 */
export const planSupport: Record<PlanId, {
  days: string; timings: string; p1: string; fairUsage: string; window: string;
}> = {
  foundation: { days: 'Monday to Friday', timings: '9am to 6pm', p1: 'Up to 6 hrs/mo', fairUsage: 'Up to 15 requests/mo', window: '9x5' },
  care:       { days: 'Monday to Friday', timings: '8am to 8pm', p1: 'Up to 8 hrs/mo', fairUsage: 'Up to 30 requests/mo', window: '12x5' },
  assure:     { days: 'Monday to Saturday', timings: '8am to 11:59pm', p1: 'Up to 10 hrs/mo', fairUsage: 'Up to 50 requests/mo', window: '16x6' },
  elite:      { days: 'Monday to Saturday', timings: 'Round the clock', p1: 'Unlimited', fairUsage: 'Reasonable unlimited', window: '24x6' },
};

/** Tiers from least to most inclusive. */
export const planOrder: PlanId[] = ['foundation', 'care', 'assure', 'elite'];

const planRank = (id: string) => planOrder.indexOf(id as PlanId);

/**
 * Service areas bundled into a tier. Coverage is cumulative — Care includes
 * everything in Foundation, Assure everything in Care, and so on — exactly as
 * the technical-activities matrix defines it. A service's `categoryId` is the
 * tier that first unlocks it.
 */
export const includedAddOnsForPlan = (planId: PlanId): AddOn[] => {
  const rank = planRank(planId);
  return allAddOns.filter((a) => {
    const unlockRank = planRank(a.categoryId);
    return unlockRank !== -1 && unlockRank <= rank;
  });
};

/** Whether a tier bundles this service rather than charging for it separately. */
export const isIncludedInPlan = (addOnId: string, planId: PlanId): boolean =>
  includedAddOnsForPlan(planId).some((a) => a.id === addOnId);

/** A 0 price means "not priced yet" — show TBD rather than a misleading ₹0K. */
export const fmtK = (n: number) => (n > 0 ? '₹' + (n / 1000).toFixed(0) + 'K' : 'TBD');
