'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ArrowRight, AlertCircle,
  CheckCircle2, RefreshCw, ChevronLeft, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { OtpActionState } from '@/app/(auth)/otp-actions';
import { sendOtpAction, verifyOtpAction } from '@/app/(auth)/otp-actions';

/* ── Google icon ─────────────────────────────────────────── */
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

/* ── 6-box OTP input ─────────────────────────────────────── */
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !refs.current[i]?.value && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const chars = value.split('');
    chars[i] = digit;
    const next = chars.join('');
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      onChange(text.padEnd(6, ''));
      refs.current[Math.min(text.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          className={[
            'w-11 h-14 rounded-2xl text-center text-xl font-bold font-mono text-white',
            'border bg-white/5 outline-none transition-all duration-200',
            'focus:border-accent focus:bg-accent/10 focus:shadow-[0_0_20px_-4px_rgba(139,92,246,0.5)]',
            value[i] ? 'border-accent/60' : 'border-white/15',
          ].join(' ')}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ── Props ───────────────────────────────────────────────── */
interface AuthFormProps {
  mode: 'sign-up' | 'sign-in';
  /** Kept for compatibility — unused in OTP mode */
  action?: unknown;
}

const oauthErrorMessages: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet — use email OTP for now.",
  google_auth_failed: "Google sign-in didn't go through. Please try again.",
};

type Step = 'email' | 'otp';

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams   = useSearchParams();
  const oauthError     = searchParams.get('error');
  const isSignUp       = mode === 'sign-up';

  const [step, setStep]           = useState('email' as Step);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue]   = useState('');
  const [countdown, setCountdown] = useState(0);

  /* — Step 1: send OTP — */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sendState, sendAction, sendPending] = useActionState(sendOtpAction as any, {} as OtpActionState);

  /* — Step 2: verify OTP — */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtpAction as any, {} as OtpActionState);

  /* Advance to OTP step when send succeeds */
  useEffect(() => {
    if (sendState.success && sendState.email) {
      const email = sendState.email;
      const id = requestAnimationFrame(() => {
        setPendingEmail(email);
        setStep('otp');
        setOtpValue('');
        setCountdown(60);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [sendState]);

  /* Countdown timer for resend */
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;
    const fd = new FormData();
    fd.set('email', pendingEmail);
    (sendAction as (payload: FormData) => void)(fd);
  };

  /* Auto-submit verify form when all 6 digits entered */
  const verifyFormRef = useRef(null as HTMLFormElement | null);
  useEffect(() => {
    if (step === 'otp' && otpValue.replace(/\D/g, '').length === 6) {
      verifyFormRef.current?.requestSubmit();
    }
  }, [otpValue, step]);

  return (
    <div className="w-full">
      {/* Mobile brand lockup */}
      <Link
        href="/"
        className="lg:hidden flex items-center justify-center mb-8 w-fit mx-auto"
      >
        <Image
          src="/logo1.png"
          alt="SID Managed Cloud"
          width={220}
          height={58}
          className="h-12 w-auto object-contain"
        />
      </Link>

      <div className="gradient-border p-8 sm:p-9">
        <AnimatePresence mode="wait">

          {/* ══ STEP 1 — email entry ══════════════════════════ */}
          {step === 'email' && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              <div className="text-center mb-8">
                <h1 className="font-display font-bold text-3xl text-text mb-2.5 tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-text-muted text-sm leading-relaxed">
                  {isSignUp
                    ? "Enter your email — we'll send a one-time code to sign you in."
                    : "Enter your email and we'll send a one-time code to sign you in."}
                </p>
              </div>

              {/* OAuth error */}
              {oauthError && oauthErrorMessages[oauthError] && (
                <div className="flex items-start gap-2 mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{oauthErrorMessages[oauthError]}</span>
                </div>
              )}

              {/* Send OTP form */}
              <form action={sendAction} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-text">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-sm text-text placeholder:text-text-dim focus:border-accent/60 focus:bg-accent/5 focus:shadow-[0_0_20px_-6px_rgba(139,92,246,0.4)] outline-none transition-all"
                    />
                  </div>
                  {sendState.error && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {sendState.error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={sendPending}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send one-time code
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-7">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-medium uppercase tracking-wider text-text-dim shrink-0">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Google */}
              <a
                href="/api/auth/google"
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-text group"
              >
                <GoogleIcon className="w-4.5 h-4.5 shrink-0" />
                Continue with Google
              </a>
            </motion.div>
          )}

          {/* ══ STEP 2 — OTP entry ═══════════════════════════ */}
          {step === 'otp' && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22 }}
            >
              {/* Back */}
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex items-center gap-1.5 text-xs text-text-dim hover:text-text mb-7 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="text-center mb-8">
                {/* Shield icon */}
                <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mx-auto mb-5 shadow-[0_0_30px_-8px_rgba(139,92,246,0.5)]">
                  <Shield className="w-7 h-7" />
                </div>
                <h1 className="font-display font-bold text-2xl text-text mb-2.5 tracking-tight">
                  Check your inbox
                </h1>
                <p className="text-text-muted text-sm leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="text-accent font-semibold">{pendingEmail}</span>
                  <br />
                  Enter it below to sign in.
                </p>
              </div>

              {/* Verify form */}
              <form ref={verifyFormRef} action={verifyAction} className="space-y-6" noValidate>
                <input type="hidden" name="email" value={pendingEmail} />
                <input type="hidden" name="otp" value={otpValue} />

                {/* 6-box OTP input */}
                <OtpBoxes value={otpValue} onChange={setOtpValue} />

                {/* Error */}
                {verifyState.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {verifyState.error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={verifyPending}
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Verify & Sign in
                </Button>
              </form>

              {/* Resend */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text-muted mb-2">{"Didn't receive the code?"}</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || sendPending}
                  className="inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all text-accent hover:text-accent-glow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sendPending ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Sign-in / Sign-up toggle */}
      <p className="mt-8 text-center text-sm text-text-muted">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="text-accent hover:text-accent-glow font-medium transition-colors"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </div>
  );
}
