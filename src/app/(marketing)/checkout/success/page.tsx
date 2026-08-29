'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Download, Sparkles } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="p-10 rounded-3xl border border-emerald-500/20 bg-linear-to-b from-emerald-500/10 via-white/3 to-transparent backdrop-blur-xl space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Order #SID-2026-8942 Activated
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text">Welcome to SID Managed Cloud!</h1>
          <p className="text-text-muted text-sm max-w-lg mx-auto">
            Your payment of <strong className="text-text font-mono">₹1,35,700</strong> has been processed successfully. Your dedicated cloud engineers have been notified.
          </p>
        </div>

        {/* Kickoff Steps Timeline */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/8 text-left space-y-4">
          <h2 className="font-display font-bold text-base text-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Immediate Onboarding Next Steps:
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-bold text-text">Access Your Dashboard</p>
                <p className="text-text-muted">Invite your infrastructure team and share IAM cross-account access role securely.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-bold text-text">Kickoff Architecture Call</p>
                <p className="text-text-muted">Scheduled automatically within 2 hours. Your Solutions Architect will review your workload.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-bold text-text">Initial FinOps Audit</p>
                <p className="text-text-muted">First automated cost optimization report generated within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/account"
            className="px-8 py-4 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2 text-sm"
          >
            Go to Client Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => alert('Tax Invoice #SID-2026-8942 downloaded.')}
            className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-text font-semibold hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-text-dim" /> Download Tax Invoice
          </button>
        </div>
      </motion.div>
    </div>
  );
}
