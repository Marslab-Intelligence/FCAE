import type { Metadata } from 'next';
import {
  Clock, ShieldAlert, Server, Activity, FileSpreadsheet, Shield, BarChart3, Inbox,
} from 'lucide-react';
import { SlaSeverityMatrix } from '@/components/SlaSeverityMatrix';

export const metadata: Metadata = {
  title: 'Reports — SID Managed Cloud',
};

/**
 * Environment reports.
 *
 * No telemetry, billing or ticketing source is connected yet, so every figure
 * renders an explicit empty state. Sample numbers here would be read as the
 * client's own environment — wire each card to real data and replace the `—`
 * values in place.
 */

const EMPTY = '—';

/** Compliance frameworks SID covers. The names are scope; the verdicts are client data. */
const complianceFrameworks = [
  'SOC 2 Type II Auditing',
  'GDPR / Personal Data Safe',
  'ISO/IEC 27001 ISMS',
  'PCI-DSS v4.0 Compliance',
];

function KpiCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="p-6 rounded-2xl glass-card space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">{label}</span>
      </div>
      <div>
        <h3 className="font-display font-bold text-3xl text-text-dim">{value}</h3>
        <p className="text-xs text-text-dim mt-1">{caption}</p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden" />
    </div>
  );
}

function EmptyPanel({ icon: Icon, children }: { icon: typeof Inbox; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
      <Icon className="w-7 h-7 text-text-dim/40" />
      <p className="text-xs text-text-dim">{children}</p>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-text">Environment Reports</h1>
          <p className="text-text-muted mt-1">Resource performance, ticket response SLAs, and security status.</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-text-dim cursor-not-allowed opacity-60"
          title="Available once reporting data is connected"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export PDF Report
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard label="Monthly Cloud Spend" value={EMPTY} caption="No billing data connected" />
        <KpiCard label="SLA Compliance" value={EMPTY} caption="No resolution data yet" />
        <KpiCard label="Security Health" value={EMPTY} caption="No security assessment yet" />
      </div>

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left/Middle Column (Spend & SLA Tickets) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Cloud Spend Breakdown */}
          <div className="rounded-2xl glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-display font-semibold text-base text-text flex items-center gap-2">
                <Server className="w-4 h-4 text-text-dim" /> Infrastructure Cost Distribution
              </h2>
              <span className="text-xs text-text-dim">Current billing cycle</span>
            </div>
            <EmptyPanel icon={BarChart3}>No cost data for this billing cycle</EmptyPanel>
          </div>

          {/* Ticket Performance Log */}
          <div className="rounded-2xl glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-display font-semibold text-base text-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-text-dim" /> SLA Resolution Metrics
              </h2>
              <span className="text-xs text-text-dim">{EMPTY}</span>
            </div>
            <EmptyPanel icon={Inbox}>No support tickets recorded yet</EmptyPanel>
          </div>

        </div>

        {/* Right Column (Uptime / Security Status) */}
        <div className="space-y-8">

          {/* Live System Health */}
          <div className="p-6 rounded-2xl glass-card space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-base text-text flex items-center gap-2">
                <Activity className="w-4 h-4 text-text-dim" /> Live System Health
              </h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-text-dim border border-white/10">
                No data
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-text-muted">Compute Node Latency</span>
                <span className="text-sm font-semibold text-text-dim">{EMPTY}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-text-muted">Active API Sessions</span>
                <span className="text-sm font-semibold text-text-dim">{EMPTY}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-text-muted">30d Global Uptime</span>
                <span className="text-sm font-semibold text-text-dim">{EMPTY}</span>
              </div>
            </div>

            {/* Uptime timeline — neutral until real daily results exist */}
            <div>
              <div className="flex justify-between text-[10px] text-text-dim mb-1.5">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
              <div className="flex gap-0.5 h-5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-white/5" title="No uptime data" />
                ))}
              </div>
            </div>
          </div>

          {/* Security Compliance */}
          <div className="p-6 rounded-2xl glass-card space-y-6">
            <h2 className="font-display font-semibold text-base text-text flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-text-dim" /> Compliance Status
            </h2>

            <div className="space-y-4">
              {complianceFrameworks.map((name) => (
                <div key={name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-muted text-xs">{name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white/5 text-text-dim border-white/10">
                    {EMPTY}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Incident Response & SLA Severity Matrix — contractual scope, not client data */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div>
          <h2 className="font-display font-bold text-2xl text-text flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" /> Incident Response SLA Framework
          </h2>
          <p className="text-text-muted text-sm mt-1">Guaranteed response windows and target impact scenarios per severity level.</p>
        </div>
        <SlaSeverityMatrix />
      </div>
    </div>
  );
}
