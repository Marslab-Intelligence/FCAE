'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitLeadAction, type LeadInput } from '@/app/build/actions';
import { buildRequirementSummary } from '@/lib/requirement-summary';

const INDUSTRIES = [
  'Information Technology',
  'Healthcare',
  'Financial Services',
  'Retail & E-Commerce',
  'Manufacturing',
  'Education',
  'Logistics & Transportation',
  'Media & Entertainment',
  'Real Estate',
  'Government & Public Sector',
];

/** Common markets first; the field stays free-text so anywhere else still works. */
const COUNTRIES = [
  'India', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain',
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Malaysia',
  'Germany', 'France', 'Netherlands', 'Ireland', 'South Africa', 'Kenya', 'Nigeria',
  'Japan', 'New Zealand', 'Sri Lanka', 'Bangladesh', 'Nepal',
];

const EMPTY: LeadInput = {
  companyName: '', website: '', firstName: '', lastName: '',
  email: '', phone: '', industry: 'Information Technology',
  country: '', state: '', postalCode: '',
  customerRequirement: '', customerBudget: '',
  planId: '', selectedServices: '',
};

const labelCls = 'block text-[9px] font-mono font-bold uppercase tracking-wider text-text-dim mb-1';
const fieldCls =
  'w-full bg-white/4 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-text ' +
  'placeholder:text-text-dim/50 focus:outline-none focus:border-accent/50 focus:bg-white/6 ' +
  'transition-all disabled:opacity-40 disabled:cursor-not-allowed';

function Field({
  id, label, required, error, className, children,
}: {
  id: string; label: string; required?: boolean; error?: string;
  className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-400 mt-0.5">{error}</p>}
    </div>
  );
}

export function LeadCaptureModal({
  open,
  onClose,
  planId,
  planName,
  includedServices,
  extraServices,
  customRequests,
  redirectTo,
}: {
  open: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  includedServices: string[];
  extraServices: string[];
  customRequests: string[];
  redirectTo: string;
}) {
  const [values, setValues] = useState<LeadInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Kept separate from `submitting` so the button reads honestly while the
      browser is on its way to the sign-up page. */
  const [redirecting, setRedirecting] = useState(false);
  /** Once the client edits the brief we stop regenerating over their words. */
  const [requirementEdited, setRequirementEdited] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Written from the live builder configuration, so it always reflects the
  // package on screen. Derived rather than stored — no effect can leave it
  // describing a plan the client already moved away from.
  const suggestedRequirement = useMemo(
    () => buildRequirementSummary({ planName, includedServices, extraServices, customRequests }),
    [planName, includedServices, extraServices, customRequests],
  );

  const requirementValue = requirementEdited
    ? values.customerRequirement ?? ''
    : suggestedRequirement;

  // Focus the first field and lock background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = requestAnimationFrame(() => firstFieldRef.current?.focus());
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const set = (key: keyof LeadInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (key === 'customerRequirement') setRequirementEdited(true);
    setValues((prev) => {
      // Clearing the country invalidates the state that depends on it.
      if (key === 'country') return { ...prev, country: value, state: '' };
      return { ...prev, [key]: value };
    });
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const result = await submitLeadAction({
        ...values,
        customerRequirement: requirementValue,
        planId,
        selectedServices: [...includedServices, ...extraServices].join(', '),
      });

      if (!result.ok) {
        setErrors(result.fieldErrors);
        setFormError(result.message ?? 'Please correct the highlighted fields.');
        return;
      }

      // Remember the configured tier so it lands on the account they are about
      // to create. Best-effort: the lead already records the plan against their
      // email, so a failure here doesn't lose the choice.
      await fetch('/api/pending-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      }).catch(() => {});

      // Details are saved — hand the visitor over to account creation. A full
      // navigation (not router.push) guarantees the sign-up page loads fresh
      // even if this modal was opened from a heavily-stateful builder screen.
      setRedirecting(true);
      window.location.href = redirectTo;
    } catch (err) {
      // Anything unexpected must still release the button — a silent throw
      // here used to leave it spinning on "Saving details…" forever.
      console.error('[LeadCaptureModal] submit failed:', err);
      setFormError('Something went wrong saving your details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // No document during SSR. `open` is false on the server and on the first
  // client render alike, so the portal starts empty either way and hydration
  // has nothing to disagree about.
  if (typeof document === 'undefined') return null;

  const serviceCount = includedServices.length + extraServices.length;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0e1a] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]"
            data-lenis-prevent
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/8 bg-[#0a0e1a] px-5 py-3.5">
              <div>
                <h2 id="lead-modal-title" className="font-display font-extrabold text-xl text-white tracking-tight">
                  Request Your Quote
                </h2>
                <p className="text-[11px] text-text-dim mt-0.5">
                  {planName} package · {serviceCount} service{serviceCount === 1 ? '' : 's'} attached
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-text-dim hover:text-white hover:bg-white/8 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              {/* Company & contact — three across so nothing needs scrolling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                <Field id="companyName" label="Company Name" required error={errors.companyName}>
                  <input ref={firstFieldRef} id="companyName" name="companyName" value={values.companyName}
                    onChange={set('companyName')} placeholder="Enter company name" className={fieldCls} />
                </Field>
                <Field id="website" label="Website" error={errors.website}>
                  <input id="website" name="website" value={values.website ?? ''} onChange={set('website')}
                    placeholder="https://example.com" className={fieldCls} />
                </Field>
                <Field id="industry" label="Industry" error={errors.industry}>
                  {/* Input + datalist rather than a select: the listed industries
                      still drop down, but anything not on the list can be typed
                      straight in — same pattern as the Country field below. */}
                  <input id="industry" name="industry" list="lead-industries" value={values.industry ?? ''}
                    onChange={set('industry')} placeholder="Select or type industry" className={fieldCls} />
                  <datalist id="lead-industries">
                    {INDUSTRIES.map((i) => <option key={i} value={i} />)}
                  </datalist>
                </Field>

                <Field id="firstName" label="First Name" required error={errors.firstName}>
                  <input id="firstName" name="firstName" value={values.firstName} onChange={set('firstName')}
                    placeholder="First name" className={fieldCls} />
                </Field>
                <Field id="lastName" label="Last Name" required error={errors.lastName}>
                  <input id="lastName" name="lastName" value={values.lastName} onChange={set('lastName')}
                    placeholder="Last name" className={fieldCls} />
                </Field>
                <Field id="email" label="Email ID" required error={errors.email}>
                  <input id="email" name="email" type="email" value={values.email} onChange={set('email')}
                    placeholder="email@company.com" className={fieldCls} />
                </Field>
              </div>

              {/* Contact, location & budget */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                <Field id="phone" label="Phone Number" error={errors.phone}>
                  <input id="phone" name="phone" type="tel" value={values.phone ?? ''} onChange={set('phone')}
                    placeholder="+91 98765 43210" className={fieldCls} />
                </Field>
                <Field id="country" label="Country" error={errors.country}>
                  <input id="country" name="country" list="lead-countries" value={values.country ?? ''}
                    onChange={set('country')} placeholder="Select or type country" className={fieldCls} />
                  <datalist id="lead-countries">
                    {COUNTRIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </Field>
                <Field id="state" label="State / County" error={errors.state}>
                  <input id="state" name="state" value={values.state ?? ''} onChange={set('state')}
                    disabled={!values.country} placeholder={values.country ? 'Enter state / county' : 'Select a country first'}
                    className={fieldCls} />
                </Field>
                <Field id="postalCode" label="PIN / ZIP Code" error={errors.postalCode}>
                  <input id="postalCode" name="postalCode" value={values.postalCode ?? ''} onChange={set('postalCode')}
                    placeholder="Enter zip code" className={fieldCls} />
                </Field>
                <Field id="customerBudget" label="Customer Budget" error={errors.customerBudget}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-text-dim pointer-events-none">₹</span>
                    <input id="customerBudget" name="customerBudget" inputMode="numeric" value={values.customerBudget ?? ''}
                      onChange={set('customerBudget')} placeholder="e.g. 250000" className={cn(fieldCls, 'pl-7')} />
                  </div>
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="customerRequirement" className={cn(labelCls, 'mb-0')}>
                    Customer Requirement
                  </label>
                  {requirementEdited ? (
                    <button
                      type="button"
                      onClick={() => setRequirementEdited(false)}
                      className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-text-dim hover:text-accent transition-colors"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reset to suggested
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-accent/80">
                      <Sparkles className="w-2.5 h-2.5" /> Written from your package
                    </span>
                  )}
                </div>
                <textarea
                  id="customerRequirement"
                  name="customerRequirement"
                  rows={5}
                  value={requirementValue}
                  onChange={set('customerRequirement')}
                  placeholder="Describe customer requirements"
                  data-lenis-prevent
                  className={cn(fieldCls, 'resize-y min-h-28 leading-relaxed')}
                />
                {errors.customerRequirement && (
                  <p className="text-[10px] text-rose-400 mt-0.5">{errors.customerRequirement}</p>
                )}
              </div>

              {formError && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/8 border border-rose-500/25 text-rose-300 text-[13px]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-0.5">
                <button
                  type="submit"
                  disabled={submitting || redirecting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-display font-bold text-[13px] shadow-[0_0_25px_-8px_rgba(168,85,247,0.6)] hover:from-accent-glow hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {redirecting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Taking you to sign up…</>
                    : submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving details…</>
                      : <>Submit &amp; Continue to Sign Up <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:w-28 py-3 rounded-xl bg-white/5 border border-white/10 text-text-dim hover:text-white hover:bg-white/8 text-[13px] font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
