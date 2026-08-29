import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlanDetailClient, { PlanKey, PlanDetail } from './PlanDetailClient';

const PLAN_DETAILS: Record<PlanKey, PlanDetail> = {
  foundation: {
    id: 'foundation',
    name: 'Foundation',
    category: 'Entry-level support & operations',
    tagline: 'Reliable cloud support and access to expertise (Operate Stage)',
    heroTitle: 'FOUNDATION OF THE NEW DIGITAL EPOCH',
    heroSub: 'Establish a rock-solid cloud foundation with 9/5 expert support, 24/7 infrastructure monitoring, composable primitives, and 100% cost visibility.',
    badge: 'FOUNDATION EPOCH • OPERATE STAGE',
    priceMonthly: 49000,
    priceYearly: 39000,
    icon: 'shield-check',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4',
    
    // Sapphire Blue Theme (High Visibility & Crisp Contrast)
    bgPage: 'bg-[#030914]',
    videoOpacity: 'opacity-85',
    heroOverlay: 'bg-gradient-to-t from-[#030914] via-[#030914]/30 to-transparent',
    glow1: 'bg-blue-500/35',
    glow2: 'bg-cyan-500/30',
    badgeTheme: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.4)]',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/20 border-cyan-400/40',
    borderColor: 'border-cyan-500/30',
    cardHoverBorder: 'hover:border-cyan-400/70',
    glowColor: 'shadow-[0_0_60px_rgba(6,182,212,0.4)]',
    badgeColor: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300',
    sectionBg: 'bg-[#030914]',
    meshBg: 'bg-gradient-to-b from-[#030914] via-blue-950/30 to-[#030914]',
    terminalTheme: 'border-cyan-500/40 bg-blue-950/80 text-cyan-200',

    stats: [
      { value: '9/5', label: 'Support Window (9am-6pm)' },
      { value: '1 Hour', label: 'P1 Response Target' },
      { value: '15/mo', label: 'Fair Usage Requests' },
      { value: '6 Hours', label: 'Emergency P1 Support/mo' },
    ],
    architectureServicesLeft: [
      {
        icon: 'layers',
        title: 'Reliable Cloud Operations',
        description: '24/7 automated monitoring across infrastructure, applications, and backups to detect telemetry anomalies instantly.',
      },
      {
        icon: 'activity',
        title: 'Incident Assistance & Triage',
        description: 'Dedicated triage with guaranteed 1-hour response for P1 critical outages and rapid root cause coordination.',
      },
      {
        icon: 'dollarsign',
        title: 'Cloud Cost Visibility',
        description: 'Comprehensive billing analysis, monthly cost reporting, and budget tracking to eliminate unexpected burn.',
      },
    ],
    architectureServicesRight: [
      {
        icon: 'cpu',
        title: 'Standard RFC Execution',
        description: 'Peer-reviewed operational change management for DNS, SSL, security groups, and patch updates (up to 15/mo).',
      },
      {
        icon: 'shield-check',
        title: 'IAM & Access Key Hygiene',
        description: 'Regular access key hygiene scans, IAM privilege reviews, and credential security policy recommendations.',
      },
      {
        icon: 'clock',
        title: 'COE Cloud Operations Access',
        description: 'Access to the SID Center of Excellence (COE) for baseline operational health reviews and architecture guidance.',
      },
    ],
    features: [
      '9/5 Support Window (Monday to Friday, 9:00 AM – 6:00 PM)',
      'Guaranteed P1 Critical Incident response target within 1 Hour',
      'Up to 6 Hours / Month of emergency P1 incident support',
      'Up to 15 Operational Requests per month (Fair Usage)',
      'Infrastructure, application, and backup telemetry monitoring',
      'Cloud billing analysis, monthly reporting & budget tracking',
      'Access to COE Cloud Operations for reviews & baseline guidance',
    ],
    operationalSpecs: [
      { title: '24/7 Incident Triage & Telemetry', desc: 'Real-time telemetry scanning across your AWS, Azure, or GCP workloads with rapid ticket logging and initial assessment.', icon: 'activity' },
      { title: 'Cloud Spend & Waste Visibility', desc: 'Detailed breakdown of daily resource burn rates, unattached disks, and idle instances to keep cloud spending transparent.', icon: 'dollarsign' },
      { title: 'Standard RFC Execution', desc: 'Safe, peer-reviewed operational changes for DNS records, SSL renewals, firewall rules, and security patches.', icon: 'cpu' },
    ],
    coeActivities: [
      'Cloud Operations COE Health Audit',
      'IAM Privilege & Access Key Hygiene Scan',
      'Backup & Snapshot Policy Verification',
      'Monthly Cloud Spend Breakdown & Reporting',
    ],
    slaResponse: 'Within 1 Hour (P1 Critical Response)',
    supportWindow: '9 x 5 (Mon–Fri, 9:00 AM – 6:00 PM)',
    sdmAllocation: 'Shared Pool Operational Triage Team',
  },
  care: {
    id: 'care',
    name: 'Care',
    category: 'Cost & performance optimization',
    tagline: 'Operational excellence and cloud cost optimization (Optimize Stage)',
    heroTitle: 'OPERATIONAL EXCELLENCE & CONTINUOUS COST OPTIMIZATION',
    heroSub: 'Maximize workload performance and eliminate cloud waste with continuous rightsizing, savings plan management, performance tuning, and 12/5 coverage.',
    badge: 'OPTIMIZE STAGE',
    priceMonthly: 99000,
    priceYearly: 79000,
    icon: 'gauge',
    video: '/videos/feature-2.mp4',

    // Aurora Emerald Green Theme (High Visibility & Crisp Contrast)
    bgPage: 'bg-[#021810]',
    videoOpacity: 'opacity-85',
    heroOverlay: 'bg-gradient-to-t from-[#021810] via-[#021810]/30 to-transparent',
    glow1: 'bg-emerald-500/35',
    glow2: 'bg-teal-500/30',
    badgeTheme: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20 border-emerald-400/40',
    borderColor: 'border-emerald-500/30',
    cardHoverBorder: 'hover:border-emerald-400/70',
    glowColor: 'shadow-[0_0_60px_rgba(16,185,129,0.4)]',
    badgeColor: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
    sectionBg: 'bg-[#021810]',
    meshBg: 'bg-gradient-to-b from-[#021810] via-emerald-950/30 to-[#021810]',
    terminalTheme: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200',

    stats: [
      { value: '12/5', label: 'Support Window (8am-8pm)' },
      { value: '40 Min', label: 'P1 Response Target' },
      { value: '30/mo', label: 'Fair Usage Requests' },
      { value: 'Up to 30%', label: 'Avg Cloud Savings' },
    ],
    architectureServicesLeft: [
      {
        icon: 'dollarsign',
        title: 'FinOps & Cost Optimization',
        description: 'Resource rightsizing, Savings Plan & Reserved Instance management to reduce cloud bills by up to 30%.',
      },
      {
        icon: 'zap',
        title: 'Performance Optimization',
        description: 'Application profiling, database query analysis, CDN caching optimization, and capacity planning for peak traffic.',
      },
      {
        icon: 'rocket',
        title: 'Release Coordination',
        description: 'Structured deployment coordination, release management, and zero-downtime rollback planning for production code.',
      },
    ],
    architectureServicesRight: [
      {
        icon: 'cpu',
        title: '30 Operational Requests/mo',
        description: 'Expanded fair usage allowance (up to 30 requests/month) covering operational, optimization, and configuration tasks.',
      },
      {
        icon: 'layers',
        title: 'Kubernetes Advisory',
        description: 'Advisory guidance for Kubernetes pod resource limits, node group autoscaling, and container workload tuning.',
      },
      {
        icon: 'gauge',
        title: 'COE FinOps & Architecture Access',
        description: 'Full access to Center of Excellence for monthly rightsizing audits, performance profiling, and architecture reviews.',
      },
    ],
    features: [
      '12/5 Support Window (Monday to Friday, 8:00 AM – 8:00 PM)',
      'Guaranteed P1 Critical Incident response target within 40 Minutes',
      'Up to 8 Hours / Month of emergency P1 incident support',
      'Up to 30 Operational & Optimization Requests per month',
      'Continuous resource rightsizing & Savings Plan optimization',
      'Application performance tuning & database query profiling',
      'Full COE Access for Cloud Operations, Architecture & FinOps',
    ],
    operationalSpecs: [
      { title: 'Continuous FinOps & Rightsizing', desc: 'Real-time rightsizing algorithms and Savings Plan management to trim up to 30% off monthly cloud spend.', icon: 'dollarsign' },
      { title: 'Performance Engineering & Query Profiling', desc: 'Database index tuning, CDN caching strategy, and latency profiling across critical microservices.', icon: 'zap' },
      { title: 'Release & Deployment Coordination', desc: 'Pre-deployment sanity checks, release window coordination, and automated rollback readiness.', icon: 'rocket' },
    ],
    coeActivities: [
      'Monthly FinOps Rightsizing & Cost Review',
      'Reserved Instance & Savings Plan Alignment',
      'Database Caching & Slow-Query Latency Profiling',
      'Kubernetes Pod Resource Limit Optimization',
      'Quarterly Architecture Performance Audit',
    ],
    slaResponse: 'Within 40 Minutes (P1 Critical Response)',
    supportWindow: '12 x 5 (Mon–Fri, 8:00 AM – 8:00 PM)',
    sdmAllocation: 'Named Senior SDM Lead',
  },
  assure: {
    id: 'assure',
    name: 'Assure',
    category: 'Governance, security & risk reduction',
    tagline: 'Governance, security, and business continuity (Govern Stage)',
    heroTitle: 'CONTINUOUS SECURITY GOVERNANCE & BUSINESS CONTINUITY',
    heroSub: 'Safeguard your cloud infrastructure against security threats with 16/6 coverage, automated compliance readiness, DR planning, and a dedicated SDM.',
    badge: 'GOVERN STAGE (MOST POPULAR)',
    priceMonthly: 179000,
    priceYearly: 149000,
    icon: 'lock',
    video: '/videos/feature-3.mp4',

    // Solar Amber Gold Theme (High Visibility & Crisp Contrast)
    bgPage: 'bg-[#180e03]',
    videoOpacity: 'opacity-85',
    heroOverlay: 'bg-gradient-to-t from-[#180e03] via-[#180e03]/30 to-transparent',
    glow1: 'bg-amber-500/35',
    glow2: 'bg-yellow-500/30',
    badgeTheme: 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/20 border-amber-400/40',
    borderColor: 'border-amber-500/30',
    cardHoverBorder: 'hover:border-amber-400/70',
    glowColor: 'shadow-[0_0_60px_rgba(245,158,11,0.4)]',
    badgeColor: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
    sectionBg: 'bg-[#180e03]',
    meshBg: 'bg-gradient-to-b from-[#180e03] via-amber-950/30 to-[#180e03]',
    terminalTheme: 'border-amber-500/40 bg-amber-950/80 text-amber-200',

    stats: [
      { value: '16/6', label: 'Support Window (Mon-Sat)' },
      { value: '30 Min', label: 'P1 Response Target' },
      { value: '50/mo', label: 'Fair Usage Requests' },
      { value: 'Dedicated', label: 'Service Delivery Mgr' },
    ],
    architectureServicesLeft: [
      {
        icon: 'shield',
        title: 'Security Governance & Posture',
        description: 'Continuous vulnerability reviews, security posture assessments, SIEM threat monitoring, and risk remediation.',
      },
      {
        icon: 'lock',
        title: 'Business Continuity & DR',
        description: 'Backup validation, disaster recovery (DR) readiness reviews, and recovery planning to eliminate outage risks.',
      },
      {
        icon: 'shield-check',
        title: 'Cloud & Tagging Governance',
        description: 'Resource governance reviews, change management auditing, tagging compliance, and best-practice assessments.',
      },
    ],
    architectureServicesRight: [
      {
        icon: 'clock',
        title: 'Dedicated Service Delivery Mgr',
        description: 'Single point of contact who owns your operational SLA, manages escalations, and conducts quarterly reviews.',
      },
      {
        icon: 'activity',
        title: 'Executive Business Reviews',
        description: 'Quarterly business reviews, service performance reporting, compliance gap assessments, and risk governance.',
      },
      {
        icon: 'cpu',
        title: 'COE Governance & Security',
        description: 'Full COE access including Operations, Architecture, FinOps, Security, Business Continuity, and DevOps.',
      },
    ],
    features: [
      '16/6 Extended Support Window (Mon–Sat, 8:00 AM – 11:59 PM)',
      'Guaranteed P1 Critical Incident response target within 30 Minutes',
      'Up to 10 Hours / Month of emergency P1 incident support',
      'Up to 50 Operational, Governance & Risk Requests per month',
      'Dedicated Service Delivery Manager (SDM) & Executive Oversight',
      'Vulnerability reviews, security posture & compliance readiness',
      'Backup validation & Disaster Recovery (DR) readiness reviews',
      'Quarterly Executive Business Reviews & Service Performance Reports',
    ],
    operationalSpecs: [
      { title: 'Zero-Trust Security Governance', desc: 'Continuous vulnerability scanning, SIEM log analysis, and IAM least-privilege enforcement across cloud accounts.', icon: 'shield' },
      { title: 'Business Continuity & DR Readiness', desc: 'Automated backup validation, multi-region recovery testing, and documented DR playbooks.', icon: 'lock' },
      { title: 'Dedicated Executive SDM', desc: 'Direct access to your dedicated Service Delivery Manager who manages your operational SLA and escalations.', icon: 'clock' },
    ],
    coeActivities: [
      'Weekly Threat & Vulnerability Scanning Audit',
      'Compliance Gap Assessment & Governance Review',
      'Quarterly Executive Security & SLA Review',
      'IAM Privilege & RBAC Compliance Audit',
      'Disaster Recovery Simulation & Backup Validation',
    ],
    slaResponse: 'Within 30 Minutes (P1 Priority Response)',
    supportWindow: '16 x 6 (Mon–Sat, 8:00 AM – 11:59 PM)',
    sdmAllocation: 'Dedicated Senior SDM & Executive Sponsor',
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    category: 'Strategic engineering & leadership',
    tagline: 'Strategic technology leadership and executive accountability (Transform Stage)',
    heroTitle: 'ROUND-THE-CLOCK 24/6 STRATEGIC ENGINEERING PARTNERSHIP',
    heroSub: 'Empower your enterprise with 24/6 dedicated operations, 15-minute P1 SLAs, fractional CTO leadership, and full FCAE COE access.',
    badge: 'TRANSFORM STAGE (ENTERPRISE)',
    priceMonthly: 299000,
    priceYearly: 249000,
    icon: 'rocket',
    video: '/videos/web3-eos-galaxy.mp4',

    // Cosmic Violet Fuchsia Theme (High Visibility & Crisp Contrast)
    bgPage: 'bg-[#14031f]',
    videoOpacity: 'opacity-85',
    heroOverlay: 'bg-gradient-to-t from-[#14031f] via-[#14031f]/30 to-transparent',
    glow1: 'bg-purple-500/40',
    glow2: 'bg-fuchsia-500/35',
    badgeTheme: 'bg-purple-500/20 border-fuchsia-400/50 text-fuchsia-300 shadow-[0_0_30px_rgba(217,70,239,0.4)]',
    accentText: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-500/20 border-fuchsia-400/40',
    borderColor: 'border-fuchsia-500/30',
    cardHoverBorder: 'hover:border-fuchsia-400/70',
    glowColor: 'shadow-[0_0_60px_rgba(217,70,239,0.45)]',
    badgeColor: 'bg-purple-500/20 border-fuchsia-400/40 text-fuchsia-300',
    sectionBg: 'bg-[#14031f]',
    meshBg: 'bg-gradient-to-b from-[#14031f] via-purple-950/35 to-[#14031f]',
    terminalTheme: 'border-fuchsia-500/40 bg-purple-950/80 text-fuchsia-200',

    stats: [
      { value: '24/6', label: 'Round-the-Clock Support' },
      { value: '15 Min', label: 'P1 Response Guarantee' },
      { value: 'Unlimited', label: 'P1 Emergency Support' },
      { value: 'Fractional', label: 'CTO & Chief Architect' },
    ],
    architectureServicesLeft: [
      {
        icon: 'rocket',
        title: 'Strategic Technology Roadmap',
        description: 'Technology roadmap workshops, cloud strategy reviews, and long-term enterprise growth planning.',
      },
      {
        icon: 'dollarsign',
        title: 'Technology Investment Alignment',
        description: 'Cost vs. business value reviews, technology prioritization, and investment alignment guidance.',
      },
      {
        icon: 'zap',
        title: 'Executive Visibility & Dashboards',
        description: 'Real-time executive dashboards, custom KPI reporting, and C-suite operational analytics.',
      },
    ],
    architectureServicesRight: [
      {
        icon: 'shield-check',
        title: 'Leadership Escalation Path',
        description: 'Direct access to SID senior management for urgent business-critical concerns and executive intervention.',
      },
      {
        icon: 'cpu',
        title: 'Innovation & Modernization',
        description: 'Modernization workshops, AI & data engineering advisory, automation recommendations, and cloud transformation.',
      },
      {
        icon: 'layers',
        title: 'Full FCAE COE Access',
        description: 'Unrestricted access across all 7 COE domains including AI, Data Engineering, Containers, and DevOps.',
      },
    ],
    features: [
      '24/6 Dedicated Round-the-Clock Coverage (Monday to Saturday)',
      '15-Minute P1 Critical Incident response SLA guarantee',
      'Unlimited P1 Critical Emergency Support Hours included',
      'Reasonable Unlimited Usage for Operational & Strategic Requests',
      'Dedicated Service Delivery Manager & Chief Cloud Architect',
      'Strategic Technology Roadmap Workshops & Growth Planning',
      'Technology Investment Alignment Reviews (Cost vs. Business Value)',
      'Direct Leadership Escalation Path to SID Executive Management',
      'Full FCAE COE Access (Cloud Ops, Arch, FinOps, Security, DR, DevOps, AI & Data)',
    ],
    operationalSpecs: [
      { title: '24/6 Dedicated War Room Operations', desc: 'Always-on dedicated engineering team with a guaranteed 15-minute P1 emergency response SLA.', icon: 'clock' },
      { title: 'Fractional CTO & Chief Architect Advisory', desc: 'Strategic technology leadership, vendor evaluations, architectural reviews, and multi-year roadmaps.', icon: 'rocket' },
      { title: 'Executive Escalation & Alignment', desc: 'Quarterly Executive Business Reviews, Strategic Technology Roadmap reviews, and direct leadership escalation.', icon: 'shield-check' },
    ],
    coeActivities: [
      'Quarterly Strategic Technology Roadmap Review',
      '15-Minute P1 SLA Guarantee & Dedicated War Room Response',
      'Technology Investment Alignment Review (Semi-Annual)',
      'Fractional CTO Strategic Architecture & Modernization Workshops',
      'Full-Spectrum FCAE COE Engagement (All 7 Domains)',
    ],
    slaResponse: 'Within 15 Minutes (Unlimited P1 Hours)',
    supportWindow: '24 x 6 Round-The-Clock (Mon–Sat)',
    sdmAllocation: 'Dedicated Executive SDM + Chief Cloud Architect',
  },
};

export async function generateStaticParams() {
  return [
    { tier: 'foundation' },
    { tier: 'care' },
    { tier: 'assure' },
    { tier: 'elite' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ tier: string }> }): Promise<Metadata> {
  const { tier } = await params;
  const planKey = (tier.toLowerCase() as PlanKey) || 'care';
  const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.care;
  return {
    title: `${plan.name} Plan — Foundation Epoch & SID Managed Cloud`,
    description: plan.tagline,
  };
}

export default async function PlanDetailPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params;
  const planKey = (tier.toLowerCase() as PlanKey);
  
  if (!PLAN_DETAILS[planKey]) {
    notFound();
  }

  const plan = PLAN_DETAILS[planKey];

  return <PlanDetailClient plan={plan} />;
}
