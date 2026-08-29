'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { useReveal } from '@/hooks/useGSAP';
import { DURATION_REVEAL } from '@/lib/motion';
import { Layers, Minus, Search, Activity, Cpu, Shield, DollarSign, Wrench, Crown, CheckCircle2, Frown, ArrowRight } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const categories = [
  { id: 'all', label: 'All Activities', icon: Activity },
  { id: 'operations', label: 'Reliable Cloud Operations', icon: Cpu },
  { id: 'cost', label: 'Cloud Cost Optimization', icon: DollarSign },
  { id: 'governance', label: 'Security & Governance', icon: Shield },
  { id: 'performance', label: 'Performance & Architecture', icon: Wrench },
  { id: 'strategic', label: 'Strategic & Executive', icon: Crown },
];

const technicalActivities = [
  { name: 'Infrastructure Monitoring', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Continuous oversight of your cloud infrastructure to detect and alert on performance issues, resource utilization, and potential outages.' },
  { name: 'Application Monitoring', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Real-time tracking of application performance, error rates, and user experience metrics to ensure optimal service delivery.' },
  { name: 'Backup Monitoring', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Ensuring your data backups are consistently successful and recoverable, minimizing data loss risks.' },
  { name: 'Service Requests', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Handling routine operational requests and changes to your cloud environment efficiently.' },
  { name: 'Incident Management', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Rapid response and resolution for critical incidents affecting your cloud services.' },
  { name: 'Escalation Management', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Structured process for escalating unresolved issues to higher levels of expertise or management.' },
  { name: 'Root Cause Coordination', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Investigating the underlying causes of incidents to prevent recurrence and improve system reliability.' },
  { name: 'Patch Management', category: 'operations', foundation: true, care: true, assure: true, elite: true, description: 'Scheduled application of security patches and updates to maintain system integrity and compliance.' },
  { name: 'Release Coordination', category: 'operations', foundation: false, care: true, assure: true, elite: true, description: 'Orchestrating the deployment of new features and updates with minimal disruption to services.' },
  
  { name: 'Billing Analysis', category: 'cost', foundation: true, care: true, assure: true, elite: true, description: 'Detailed review of cloud billing data to identify spending patterns and potential savings opportunities.' },
  { name: 'Cost Reporting', category: 'cost', foundation: true, care: true, assure: true, elite: true, description: 'Regular reports on cloud expenditure, providing transparency and insights into your financial performance.' },
  { name: 'Budget Tracking', category: 'cost', foundation: true, care: true, assure: true, elite: true, description: 'Monitoring cloud spend against predefined budgets to prevent overruns and ensure financial control.' },
  { name: 'Resource Rightsizing', category: 'cost', foundation: false, care: true, assure: true, elite: true, description: 'Optimizing compute and storage resources to match actual usage, reducing unnecessary costs.' },
  { name: 'Savings Plan Reviews', category: 'cost', foundation: false, care: true, assure: true, elite: true, description: 'Analyzing and recommending optimal Reserved Instance and Savings Plan purchases for long-term cost efficiency.' },
  { name: 'Cost Optimization Recommendations', category: 'cost', foundation: false, care: true, assure: true, elite: true, description: 'Providing actionable advice and strategies to continuously reduce cloud spending.' },
  
  { name: 'Application Insights', category: 'performance', foundation: false, care: true, assure: true, elite: true, description: 'Deep dives into application performance data to identify bottlenecks and areas for improvement.' },
  { name: 'Database Query Analysis', category: 'performance', foundation: false, care: true, assure: true, elite: true, description: 'Optimizing database queries for faster response times and improved application performance.' },
  { name: 'Capacity Planning', category: 'performance', foundation: false, care: true, assure: true, elite: true, description: 'Forecasting future resource needs to ensure your cloud environment can handle growth without performance degradation.' },
  { name: 'Change Management Reviews', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Reviewing and approving changes to your cloud environment to maintain stability and compliance.' },
  { name: 'Resource Governance Reviews', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Ensuring cloud resources are provisioned and managed according to organizational policies and best practices.' },
  { name: 'Tagging & Policy Reviews', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Implementing and enforcing consistent tagging strategies for better resource management and cost allocation.' },
  
  { name: 'Cloud Best Practice Assessments', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Evaluating your cloud setup against industry best practices for security, reliability, and operational excellence.' },
  { name: 'Security Posture Assessments', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Comprehensive evaluation of your cloud security controls and identification of vulnerabilities.' },
  { name: 'Security Recommendations', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Providing actionable recommendations to enhance your cloud security and mitigate risks.' },
  { name: 'Vulnerability Reviews', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Regular scanning and analysis to identify and address security vulnerabilities in your cloud environment.' },
  { name: 'Backup Validation', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Verifying the integrity and recoverability of your data backups to ensure business continuity.' },
  { name: 'DR Readiness Reviews', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Assessing your disaster recovery plans and capabilities to ensure rapid recovery from major incidents.' },
  { name: 'Recovery Planning', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Developing and maintaining detailed recovery runbooks so teams know exactly what to do when disaster strikes.' },
  { name: 'Compliance Gap Assessment', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Identifying gaps between your current cloud posture and the compliance frameworks you need to meet.' },
  { name: 'Governance Reviews', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Periodic review of policies, controls, and ownership to keep cloud governance aligned with business needs.' },
  { name: 'Audit Readiness Guidance', category: 'governance', foundation: false, care: false, assure: true, elite: true, description: 'Preparing evidence, documentation, and controls ahead of internal or external compliance audits.' },

  { name: 'Quarterly Business Reviews', category: 'strategic', foundation: false, care: false, assure: true, elite: true, description: 'Structured quarterly session covering delivered outcomes, business impact, and upcoming priorities.' },
  { name: 'Service Performance Reviews', category: 'strategic', foundation: false, care: false, assure: true, elite: true, description: 'Deep dive into service delivery metrics and trends against agreed commitments.' },
  { name: 'Risk & Governance Reviews', category: 'strategic', foundation: false, care: false, assure: true, elite: true, description: 'Executive-level review of operational, security, and governance risks and how they are being managed.' },
  { name: 'Executive Steering Discussions', category: 'strategic', foundation: false, care: false, assure: true, elite: true, description: 'Direct conversations with leadership on strategic priorities, escalations, and key decisions.' },
  { name: 'Technology Roadmap Workshops', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Collaborative sessions to shape the future technology and cloud strategy roadmap.' },
  { name: 'Growth Planning', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Aligning cloud architecture and investment plans with projected business growth.' },
  { name: 'Cloud Strategy Reviews', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Periodic assessment of overall cloud strategy, modernization plans, and architecture evolution.' },
  { name: 'Cost vs Business Value Reviews', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Evaluating cloud spend against the business value it delivers to guide investment decisions.' },
  { name: 'Technology Prioritization', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Helping leadership rank and sequence technology initiatives by business impact.' },
  { name: 'Investment Guidance', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Advisory guidance on where to direct technology investment for maximum return.' },
  { name: 'Executive Dashboards', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Real-time, C-suite-ready dashboards summarizing cloud health, cost, and risk.' },
  { name: 'KPI Reporting', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Regular reporting against the KPIs that matter most to executive stakeholders.' },
  { name: 'Management Escalation', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Direct access to SID senior management for urgent, business-critical concerns.' },
  { name: 'Executive Oversight', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Ongoing leadership-level oversight of service delivery and strategic outcomes.' },
  { name: 'Priority Issue Resolution', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Fast-tracked resolution path for issues flagged as top priority by leadership.' },
  { name: 'Modernization Workshops', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Hands-on workshops identifying opportunities to modernize legacy workloads and architecture.' },
  { name: 'AI & Automation Recommendations', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'Guidance on where AI and automation can reduce toil and unlock new capability.' },
  { name: 'Cloud Transformation Planning', category: 'strategic', foundation: false, care: false, assure: false, elite: true, description: 'End-to-end planning for large-scale cloud transformation and migration initiatives.' },
];

const planInfo = {
  foundation: { label: 'Foundation', color: 'text-blue-400' },
  care: { label: 'Care', color: 'text-emerald-400' },
  assure: { label: 'Assure', color: 'text-amber-400' },
  elite: { label: 'Elite', color: 'text-purple-400' },
};

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="text-accent font-bold bg-accent/10 rounded-sm px-0.5">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

type TechnicalActivity = typeof technicalActivities[0] & { description?: string };

function ActivityCard({ activity, isFeatured = false, highlightQuery = '' }: { activity: TechnicalActivity, isFeatured?: boolean, highlightQuery?: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Define the spring transition for the flip effect
  const springFlipTransition = {
    type: 'spring' as const,
    stiffness: 150, // Adjust for more or less "bounciness"
    damping: 12,    // Adjust for how quickly the bounce settles
    mass: 1,        // Adjust for the "weight" of the card
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }} // Removed rotateY from here, inner divs handle flip
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }} // This transition is for opacity and scale of the card container
      className={cn(
        'reveal-card h-56 rounded-2xl liquid-glass overflow-visible p-5 flex flex-col transition-all duration-300 hover:bg-white/[0.08] relative perspective-1000',
        isFeatured ? 'md:col-span-2' : ''
      )}
      style={{ transformStyle: 'preserve-3d' }}
      onClick={() => setIsFlipped(!isFlipped)} // Click anywhere on the card to flip
    >
      {/* Front Face */}
      <motion.div
        className="absolute inset-0 backface-hidden flex flex-col p-5"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? -180 : 0 }}
        transition={springFlipTransition} // Apply spring transition here
      >
        <h4 className="font-semibold text-white mb-4 text-sm">
          <Highlight text={activity.name} highlight={highlightQuery} />
        </h4>
        <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.keys(planInfo).map(planKey => {
            const plan = planInfo[planKey as keyof typeof planInfo];
            const included = activity[planKey as keyof typeof activity];
            return (
              <div key={plan.label} className="flex items-center gap-1.5">
                {included ? <CheckCircle2 className={`w-3.5 h-3.5 ${plan.color}`} /> : <Minus className="w-3.5 h-3.5 text-white/45/30" />}
                <span className={`text-xs font-medium ${included ? 'text-white/55' : 'text-white/45/50'}`}>{plan.label}</span>
              </div>
            );
          })}
        </div>
        <button className="mt-4 text-xs text-accent hover:text-accent-glow self-end">
          Details <ArrowRight className="w-3 h-3 inline-block ml-1" />
        </button>
      </motion.div>

      {/* Back Face */}
      <motion.div
        className="absolute inset-0 backface-hidden flex flex-col p-5"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: isFlipped ? 0 : 180 }} // Back face rotates from 0 to 180 when flipped
        transition={springFlipTransition} // Apply spring transition here
      >
        <h4 className="font-semibold text-white mb-2 text-sm">
          {activity.name}
        </h4>
        <p className="text-xs font-medium text-white/45 uppercase tracking-wider mb-3">Category: {activity.category}</p>
        <p className="text-sm text-white/55 leading-relaxed grow">
          {activity.description || 'No detailed description available for this activity.'}
        </p>
        <button className="mt-4 text-xs text-accent hover:text-accent-glow self-end">
          Back <ArrowRight className="w-3 h-3 inline-block ml-1 rotate-180" />
        </button>
      </motion.div>
    </motion.div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function DeepFeatures() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelector('.activities-headline'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  useReveal('#activities .reveal-card', { y: 24, duration: DURATION_REVEAL, ease: 'power3.out' });

  const filteredActivities = technicalActivities.filter((act) => {
    const matchesCat = selectedCategory === 'all' || act.category === selectedCategory;
    const matchesSearch = act.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section
      id="activities"
      ref={sectionRef}
      className="relative section-y overflow-hidden"
      aria-labelledby="activities-heading"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-linear-to-r from-accent/5 via-transparent to-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass text-sm font-medium text-white/55 mb-6"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            Engineering Activity Catalog
          </motion.span>
          <h2
            id="activities-heading"
            className="activities-headline font-display font-semibold text-fluid-h2 tracking-tight leading-tight text-white mb-4"
          >
            Technical <span className="stellar-gradient-text">Activities</span>
          </h2>
          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            Granular technical tasks and continuous operational activities performed across cloud tiers.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all duration-300',
                    selectedCategory === cat.id
                      ? 'bg-accent text-white border-accent shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'liquid-glass text-white/55 hover:bg-white/[0.08] hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-white/55 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-sm text-white placeholder:opacity-50 focus:outline-none transition-all focus:bg-white/[0.08]"
            />
          </div>
        </div>

        {/* Activities Table Card */}
        {filteredActivities.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredActivities.map((act, index) => (
                <ActivityCard 
                  key={act.name} 
                  activity={act} 
                  isFeatured={index === 0}
                  highlightQuery={debouncedSearchQuery}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6 rounded-2xl liquid-glass"
          >
            <Frown className="w-12 h-12 mx-auto text-white/45/50 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Activities Found</h3>
            <p className="text-white/55">Try adjusting your search or filter to find what you&apos;re looking for.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}