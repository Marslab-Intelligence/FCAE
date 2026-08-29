import type { Metadata } from 'next';
import { SlaSeverityMatrix } from '@/components/SlaSeverityMatrix';
import { ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SLA Commitments — SID Managed Cloud',
  description: 'Guaranteed cloud infrastructure response SLAs, uptime targets, and incident severity handling.',
};

export default function SlaPage() {
  return (
    <div className="min-h-screen pt-nav pb-24 text-text px-5 sm:px-10 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Guaranteed SLA Commitments
        </div>
        <h1 className="font-display font-extrabold text-fluid-h2 text-text">
          Incident Response & Severity SLA Matrix
        </h1>
        <p className="text-text-muted text-fluid-body font-light">
          Our round-the-clock Center of Excellence guarantees strict initial response windows and rapid remediation protocols based on severity level.
        </p>
      </div>

      {/* SLA Matrix Grid */}
      <SlaSeverityMatrix />

      {/* Guarantees Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-lg text-text">99.99% Uptime Guarantee</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Multi-region high-availability failover backed by service level credits for any unexcused downtime.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-lg text-text">&lt; 15-Minute P1 Response</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Immediate war-room activation with dedicated Lead Site Reliability Engineers assigned instantly.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-lg text-text">24/7 COE Monitoring</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Continuous synthetic monitoring, automated telemetry, and real-time anomaly detection.
          </p>
        </div>
      </div>
    </div>
  );
}
