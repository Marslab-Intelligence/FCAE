'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-10">
          <Image
            src="/logo1.png"
            alt="SID Managed Cloud"
            width={220}
            height={58}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {submitted ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="font-display font-bold text-2xl text-text mb-3">Check your email</h1>
            <p className="text-text-muted text-sm leading-relaxed mb-8">
              We&apos;ve sent a password reset link to <strong className="text-text">{email}</strong>. The link expires in 1 hour.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-glow text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-text mb-2">Forgot password?</h1>
              <p className="text-text-muted text-sm">No worries. We&apos;ll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-field pl-11 pr-4 py-3.5 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-semibold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-8px_rgba(168,85,247,0.6)] transition-all disabled:opacity-60"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
              Remember your password?{' '}
              <Link href="/sign-in" className="text-accent hover:text-accent-glow font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
