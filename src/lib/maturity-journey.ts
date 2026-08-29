export interface MaturityStep {
  plan: string;
  focus: string;
  desc: string;
  color: string;
}

export const maturityJourney: MaturityStep[] = [
  {
    plan: 'Foundation',
    focus: 'Operational Stability',
    desc: 'Focus on uptime, core monitoring, and fundamental incident support.',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  },
  {
    plan: 'Care',
    focus: 'Cost & Performance Optimization',
    desc: 'Unlocking FinOps, rightsizing, database analysis, and architectural guidance.',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  },
  {
    plan: 'Assure',
    focus: 'Governance, Security & Risk Reduction',
    desc: 'Comprehensive security posture, compliance readiness, and business continuity.',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
  },
  {
    plan: 'Elite',
    focus: 'Strategic Engineering Partnership & Innovation',
    desc: 'Full COE access including AI/Data engineering, containers, and executive alignment.',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  },
];
