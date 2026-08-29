'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

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
            Request Received
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text">Thanks for reaching out to SID Managed Cloud!</h1>
          <p className="text-text-muted text-sm max-w-lg mx-auto">
            Online payment isn&apos;t live yet, so nothing has been charged. Your request has been recorded and a
            member of our team will contact you shortly to finalize billing and onboarding.
          </p>
        </div>

        {/* What happens next */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/8 text-left space-y-4">
          <h2 className="font-display font-bold text-base text-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> What Happens Next:
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-bold text-text">Our sales team reviews your request</p>
                <p className="text-text-muted">A Solutions Architect will reach out to confirm scope and answer any questions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-bold text-text">Billing is finalized together</p>
                <p className="text-text-muted">We&apos;ll confirm pricing and payment with you directly until online checkout is available.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-bold text-text">Onboarding begins</p>
                <p className="text-text-muted">Once confirmed, your dedicated cloud engineers kick off the engagement.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-8 py-4 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2 text-sm"
          >
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
