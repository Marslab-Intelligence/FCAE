'use client';

import React from 'react';
import {
  Server, ShieldCheck, Activity, CheckCircle2, Ticket, Zap, ArrowUpRight, Cpu,
  TrendingDown, BarChart3, type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Client cloud dashboard.
 *
 * The metrics, charts and activity feed have no data source yet, so every field
 * renders an explicit empty state rather than sample figures — a client must
 * never mistake placeholder numbers for their own infrastructure. Wire each
 * card to real telemetry and replace the `—` values in place.
 */

const EMPTY = '—';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StatCard({
  label, icon: Icon, value, caption,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  caption: string;
}) {
  return (
    <div className="p-5 rounded-xl glass-card glass-card-hover space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <Icon className="w-4 h-4 text-text-dim" />
      </div>
      <div className="flex items-baseline justify-between">
        <p className="font-display font-bold text-3xl text-text-dim tracking-tight">{value}</p>
      </div>
      <p className="text-xs font-medium text-text-dim">{caption}</p>
    </div>
  );
}

/** Shared placeholder for a chart with nothing to plot yet. */
function EmptyChart({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-48 w-full border-b border-border pb-3 flex flex-col items-center justify-center gap-2 text-center">
      <BarChart3 className="w-7 h-7 text-text-dim/40" />
      <p className="text-xs text-text-dim">{children}</p>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6 text-text font-sans pb-12 transition-colors duration-300">
      {/* Cloud Infrastructure Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Cloud Nodes" icon={Server} value={EMPTY} caption="Awaiting infrastructure sync" />
        <StatCard label="Monthly Cloud Spend" icon={Zap} value={EMPTY} caption="No billing data connected" />
        <StatCard label="SLA Uptime (30d)" icon={Activity} value={EMPTY} caption="No uptime data yet" />
        <StatCard label="Security Findings" icon={ShieldCheck} value={EMPTY} caption="No audit data yet" />
      </div>

      {/* Analytics Charts Grid (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compute & Memory Workload */}
        <div className="p-6 rounded-xl glass-card flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-base text-text">Compute &amp; Memory Utilization</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-text-dim border border-white/10 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> {EMPTY}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">Daily peak compute workload across your managed clusters.</p>
          </div>

          <div className="pt-4">
            <EmptyChart>No utilization data for this period</EmptyChart>
            <div className="flex justify-between gap-3 px-2 pt-3 text-xs text-text-dim">
              {weekdays.map((day) => (
                <span key={day} className="flex-1 text-center font-medium">{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Cloud Cost Optimization Trend */}
        <div className="p-6 rounded-xl glass-card flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-base text-text">Cloud Cost Optimization Trend</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-text-dim border border-white/10 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> {EMPTY}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1">Daily cloud resource cost efficiency trend.</p>
          </div>

          <div className="pt-4">
            <EmptyChart>No cost trend data for this period</EmptyChart>
            <div className="flex justify-between px-1 pt-3 text-xs text-text-dim font-medium">
              <span>{EMPTY}</span>
              <span>{EMPTY}</span>
              <span>{EMPTY}</span>
              <span>{EMPTY}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Summary Cards (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Managed Cloud Tier */}
        <div className="p-6 rounded-xl glass-card glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-text">Managed Cloud Tier</h3>
            <Server className="w-4 h-4 text-text-dim" />
          </div>
          <p className="text-xs text-text-muted">Your active SID cloud subscription plan.</p>
          <div className="p-4 rounded-lg bg-bg-slate/40 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-text-dim">{EMPTY}</span>
            </div>
            <p className="text-xs text-text-dim">Support window: {EMPTY}</p>
          </div>
          <Link href="/account/plan" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
            View your package <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* SLA & Security Health */}
        <div className="p-6 rounded-xl glass-card glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-text">Cloud SLA &amp; Security</h3>
            <CheckCircle2 className="w-4 h-4 text-text-dim" />
          </div>
          <p className="text-xs text-text-muted">Automated security &amp; backup health status.</p>
          <div className="p-4 rounded-lg bg-white/3 border border-border flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-text-dim/40" />
            <div>
              <p className="text-xs font-semibold text-text-dim">No health data yet</p>
              <p className="text-[11px] text-text-dim">Connect a cloud account to see status</p>
            </div>
          </div>
          <Link href="/account/progress" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
            View Security Reports <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Cloud Activity Log */}
        <div className="p-6 rounded-xl glass-card glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-text">Cloud Activity Log</h3>
            <Ticket className="w-4 h-4 text-text-dim" />
          </div>
          <p className="text-xs text-text-muted">Recent infrastructure events &amp; tickets.</p>
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
            <Ticket className="w-6 h-6 text-text-dim/40" />
            <p className="text-xs text-text-dim">No activity recorded yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
