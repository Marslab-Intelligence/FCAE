'use client';

import React from 'react';
import { Flame, AlertTriangle, AlertCircle, Info, Clock, type LucideIcon } from 'lucide-react';

interface SeverityItem {
  id: string;
  badgeLeft: string;
  badgeRight: string;
  title: string;
  icon: LucideIcon;
  description: string;
  impactScenarios: string;
  theme: {
    badgeLeftBg: string;
    badgeLeftText: string;
    badgeRightBorder: string;
    badgeRightText: string;
    iconBg: string;
    iconColor: string;
    cardBg: string;
    cardBorder: string;
    cardGlow: string;
    insetBg: string;
    insetBorder: string;
    dotColor: string;
  };
}

const severityData: SeverityItem[] = [
  {
    id: 'p1',
    badgeLeft: 'P1 - CRITICAL OUTAGE',
    badgeRight: '< 15-Min Response',
    title: 'P1 Critical',
    icon: Flame,
    description: 'Complete outage of a production service with significant business impact and no available workaround.',
    impactScenarios: 'Production application unavailable, customer-facing website down, critical ERP inaccessible.',
    theme: {
      badgeLeftBg: 'bg-[#9f1239]',
      badgeLeftText: 'text-white font-bold',
      badgeRightBorder: 'border-[#9f1239]/60 bg-[#9f1239]/10',
      badgeRightText: 'text-[#f43f5e]',
      iconBg: 'bg-[#881337]/50 border border-[#f43f5e]/40',
      iconColor: 'text-[#f43f5e]',
      cardBg: 'bg-[#18080c]/85 backdrop-blur-xl',
      cardBorder: 'border-rose-500/35 hover:border-rose-500/60',
      cardGlow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]',
      insetBg: 'bg-[#0f0407]/90',
      insetBorder: 'border-rose-500/20',
      dotColor: 'bg-[#f43f5e]',
    },
  },
  {
    id: 'p2',
    badgeLeft: 'P2 - HIGH SEVERITY',
    badgeRight: '< 30-Min Response',
    title: 'P2 High',
    icon: AlertTriangle,
    description: 'Major degradation affecting business operations where limited workaround exists.',
    impactScenarios: 'Application performance severely impacted, key business function unavailable, multiple users affected.',
    theme: {
      badgeLeftBg: 'bg-[#854d0e]',
      badgeLeftText: 'text-[#fef08a] font-bold',
      badgeRightBorder: 'border-[#854d0e]/60 bg-[#854d0e]/10',
      badgeRightText: 'text-[#eab308]',
      iconBg: 'bg-[#713f12]/50 border border-[#eab308]/40',
      iconColor: 'text-[#eab308]',
      cardBg: 'bg-[#1a1408]/85 backdrop-blur-xl',
      cardBorder: 'border-amber-500/35 hover:border-amber-500/60',
      cardGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      insetBg: 'bg-[#0e0a04]/90',
      insetBorder: 'border-amber-500/20',
      dotColor: 'bg-[#eab308]',
    },
  },
  {
    id: 'p3',
    badgeLeft: 'P3 - MEDIUM IMPACT',
    badgeRight: '< 1-Hour Response',
    title: 'P3 Medium',
    icon: AlertCircle,
    description: 'Partial service impact where a workaround is available and business operations can continue.',
    impactScenarios: 'Non-critical functionality affected, limited user impact, intermittent issues.',
    theme: {
      badgeLeftBg: 'bg-[#155e75]',
      badgeLeftText: 'text-[#cffaff] font-bold',
      badgeRightBorder: 'border-[#155e75]/60 bg-[#155e75]/10',
      badgeRightText: 'text-[#06b6d4]',
      iconBg: 'bg-[#164e63]/50 border border-[#06b6d4]/40',
      iconColor: 'text-[#06b6d4]',
      cardBg: 'bg-[#08141a]/85 backdrop-blur-xl',
      cardBorder: 'border-cyan-500/35 hover:border-cyan-500/60',
      cardGlow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]',
      insetBg: 'bg-[#030b0e]/90',
      insetBorder: 'border-cyan-500/20',
      dotColor: 'bg-[#06b6d4]',
    },
  },
  {
    id: 'p4',
    badgeLeft: 'P4 - REQUEST / ADVISORY',
    badgeRight: '< 6-Hour Response',
    title: 'P4 Low',
    icon: Info,
    description: 'Service requests, information requests, minor issues, planned activities, or enhancement requests.',
    impactScenarios: 'User requests, configuration changes, access requests, advisory support, documentation requests.',
    theme: {
      badgeLeftBg: 'bg-[#065f46]',
      badgeLeftText: 'text-[#d1fae5] font-bold',
      badgeRightBorder: 'border-[#065f46]/60 bg-[#065f46]/10',
      badgeRightText: 'text-[#10b981]',
      iconBg: 'bg-[#047857]/40 border border-[#10b981]/40',
      iconColor: 'text-[#10b981]',
      cardBg: 'bg-[#081a14]/85 backdrop-blur-xl',
      cardBorder: 'border-emerald-500/35 hover:border-emerald-500/60',
      cardGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      insetBg: 'bg-[#030e0a]/90',
      insetBorder: 'border-emerald-500/20',
      dotColor: 'bg-[#10b981]',
    },
  },
];

export function SlaSeverityMatrix() {
  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {severityData.map((item) => {
          const IconComponent = item.icon;
          const { theme } = item;

          return (
            <div
              key={item.id}
              className={`relative rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${theme.cardBg} ${theme.cardBorder} ${theme.cardGlow} glass-card`}
            >
              {/* Top Header Row with Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                {/* Left Badge (Pill) */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs tracking-wider uppercase ${theme.badgeLeftBg} ${theme.badgeLeftText} flex items-center gap-1.5 shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full ${theme.dotColor} animate-pulse`} />
                    {item.badgeLeft}
                  </span>
                </div>

                {/* Right Badge (SLA Response Time) */}
                <div className={`px-3.5 py-1 rounded-full text-xs font-mono font-medium border ${theme.badgeRightBorder} ${theme.badgeRightText} flex items-center gap-1.5`}>
                  <Clock className="w-3.5 h-3.5" />
                  {item.badgeRight}
                </div>
              </div>

              {/* Title & Icon Row */}
              <div className="flex items-center gap-3.5 mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${theme.iconBg} shadow-inner shrink-0`}>
                  <IconComponent className={`w-5 h-5 ${theme.iconColor}`} />
                </div>
                <h3 className="font-display font-bold text-fluid-h3 text-white tracking-tight">
                  {item.title}
                </h3>
              </div>

              {/* Main Description */}
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                {item.description}
              </p>

              {/* Inset Box: Impact Scenarios */}
              <div className={`rounded-2xl border p-4 sm:p-4.5 ${theme.insetBg} ${theme.insetBorder}`}>
                <p className="text-[11px] font-mono font-bold tracking-widest text-white/50 uppercase mb-2">
                  IMPACT SCENARIOS:
                </p>
                <p className="text-xs sm:text-sm font-mono text-white/80 leading-relaxed font-light">
                  {item.impactScenarios}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
