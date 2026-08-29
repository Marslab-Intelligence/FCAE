export const chapter1Content = {
  eyebrow: 'FCAE',
  headline: 'Enterprise Cloud Architecture & Engineering as a Service',
  subhead: 'Premium expertise. Predictable cost. Maximum business impact.',
  cardKicker: 'What is FCAE?',
  cardBody:
    'Modern cloud environments demand more than infrastructure support. They require continuous architecture, engineering, security, optimization, and innovation. Fractional Cloud Architecture & Engineering (FCAE) gives your business access to an experienced team—all through a predictable monthly subscription.',
  cardTags: [
    'Cloud Architects',
    'DevOps Engineers',
    'Security Specialists',
    'FinOps Consultants',
    'AI Engineers',
  ],
  closer: {
    line1: 'Enterprise expertise.',
    line2: 'Without enterprise hiring.',
  },
  partnerBadges: [
    { src: '/test_aws_clean.png', alt: 'AWS Partner Advanced Tier' },
    { src: '/ms_partner_infra.png', alt: 'Microsoft Solutions Partner' },
  ],
} as const;

export const roleNodes = [
  { label: 'Architects', icon: 'User' },
  { label: 'Engineers', icon: 'Code2' },
  { label: 'Specialists', icon: 'Shield' },
  { label: 'Advisors', icon: 'TrendingUp' },
] as const;

export const chapter2Content = {
  headline: "The Cloud Has Evolved. Traditional Support Hasn't.",
  cardKicker: 'Why Businesses Need FCAE',
  cardBody:
    "Managing cloud infrastructure alone is no longer enough. Today's businesses must continuously modernize applications, improve security, optimize costs, adopt AI, manage data platforms, and prepare for future technologies.",
  fragments: [
    'Cloud Architecture & Modernization',
    'Kubernetes & Container Platforms',
    'Monolithic to Microservices Transformation',
    'DevOps & Platform Engineering',
    'Data Engineering & Analytics',
    'AI & Intelligent Automation',
    'IoT & Connected Solutions',
    'Security, Governance & Compliance',
    'Cloud Cost Optimization (FinOps)',
  ],
  closer: {
    line1: 'Beyond infrastructure.',
    line2: 'Towards innovation.',
  },
} as const;

export const chapter3Content = {
  headline: 'Human Expertise. Powered by CORE Intelligence.',
  cardKicker: 'Why FCAE is Different',
  cardBody:
    'FCAE combines experienced cloud engineers with CORE, our intelligent cloud operations platform. While CORE continuously analyzes your cloud environment for risks, performance, security, and optimization opportunities, FCAE architects validate, engineer, and implement the right solutions.',
  benefits: [
    'Proactive recommendations instead of reactive support',
    'Continuous cloud improvement',
    'Faster decision-making',
    'Reduced operational risk',
    'Expert engineering backed by intelligent insights',
  ],
  closer: {
    line1: 'Human expertise. Intelligent automation.',
    line2: 'Continuous innovation.',
  },
} as const;

export const chapter4Content = {
  headline: "Focus on Your Business. We'll Engineer Your Cloud.",
  subline:
    'With FCAE, your organization gains the confidence to innovate while we manage the complexity.',
  cardKicker: 'Business Outcomes',
  stats: [
    'Enterprise-grade cloud expertise at a predictable monthly cost',
    'Reduce operational overhead without expanding your internal team',
    'Improve security, reliability, and cloud governance',
    'Accelerate cloud modernization and digital transformation',
    'Optimize cloud spending through continuous engineering',
    'Scale confidently with access to specialized cloud experts',
    'Stay ready for AI, data, and next-generation technologies',
  ],
  pullQuote: {
    quote:
      'FCAE gives you an entire cloud engineering team at a fraction of the cost and with greater flexibility.',
    attribution: 'Australia & UAE businesses trust SID to architect, secure and scale their cloud with confidence.',
  },
  final: {
    line1: 'One subscription. One engineering team.',
    line2: 'Continuous cloud excellence.',
  },
} as const;
