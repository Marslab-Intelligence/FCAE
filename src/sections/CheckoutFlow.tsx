'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Building2, CreditCard, Lock, ArrowRight, ChevronRight, AlertCircle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/CurrencyProvider';
import { PaymentMethodSelector, type PaymentMethod } from '@/components/PaymentMethodSelector';
import { getPlan, type PlanId } from '@/lib/package-catalog';
import { clearBuilderSelection, readBuilderSelection, resolveFullSelection, type SelectedItem } from '@/lib/builder-cart';
import { submitOrderAction } from '@/app/(marketing)/checkout/actions';

export function CheckoutFlow() {
  const { price } = useCurrency();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    contactName: '',
    email: '',
    phone: '',
    cloudProvider: 'AWS',
    monthlyBudget: '50k-2L',
    paymentMethod: 'card' as PaymentMethod,
  });

  const [hydrated, setHydrated] = useState(false);
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [extras, setExtras] = useState<SelectedItem[]>([]);

  useEffect(() => {
    // localStorage needs `window`, so this can only run after mount — state
    // starts empty to match SSR output, then this one-time read fills it in.
    const saved = readBuilderSelection();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlanId(saved.planId);
      setExtras(saved.extras);
    }
    setHydrated(true);
  }, []);

  const plan = planId ? getPlan(planId) : null;
  const fullSelection = planId ? resolveFullSelection(planId, extras) : [];
  const extraItems = fullSelection.filter((s) => !s.included && !s.custom);
  const addOnsTotal = extraItems.reduce((sum, s) => sum + s.price, 0);
  const subtotal = (plan?.priceMonthly ?? 0) + addOnsTotal;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    if (!plan) return;

    // Online payment isn't wired up yet (Razorpay integration pending) — this
    // records a real pending order for the sales team to follow up on, it
    // does not charge anything.
    setLoading(true);
    setSubmitError('');
    const result = await submitOrderAction({ planId: plan.id, amount: total, currency: 'INR' });
    setLoading(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    clearBuilderSelection();
    router.push('/checkout/success');
  };

  if (hydrated && !plan) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto text-center py-20 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-text-dim">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-text mb-2">Nothing to check out yet</h2>
          <p className="text-text-muted text-sm mb-6">Configure a package in the builder first, then come back here to complete your order.</p>
          <Link
            href="/build"
            className="inline-flex px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-glow transition-all text-sm shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)]"
          >
            Open Package Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center">
    <div className="w-full max-w-5xl mx-auto" data-audit="content-block">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-text-dim mb-4">
          <Link href="/cart" className="hover:text-text transition-colors">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text font-medium">Enterprise Checkout</span>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-text">Checkout & Onboarding</h1>
        <p className="text-text-muted text-sm mt-1">Complete your organization details to initialize your SID Managed Cloud account</p>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mt-8 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all', step >= 1 ? 'bg-accent text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/10 text-text-dim')}>
              1
            </div>
            <span className="text-xs font-medium text-text">Company Info</span>
          </div>
          <div className="w-12 h-0.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all', step === 2 ? 'bg-accent text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-white/10 text-text-dim')}>
              2
            </div>
            <span className="text-xs font-medium text-text">Payment & Activation</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleNext} className="p-8 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl space-y-6">
            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Building2 className="w-5 h-5 text-accent" />
                  <h2 className="font-display font-bold text-lg text-text">Organization Details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Acme Technologies Pvt Ltd"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text text-sm focus:outline-none focus:border-accent/50 transition-all placeholder-text-dim"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">GSTIN (Optional for Invoice)</label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      placeholder="29AAAAA0000A1Z5"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text text-sm focus:outline-none focus:border-accent/50 transition-all placeholder-text-dim"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Primary Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Sameer Kumar"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text text-sm focus:outline-none focus:border-accent/50 transition-all placeholder-text-dim"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Work Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="sameer@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text text-sm focus:outline-none focus:border-accent/50 transition-all placeholder-text-dim"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Primary Cloud Provider</label>
                    <select
                      name="cloudProvider"
                      value={formData.cloudProvider}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text text-sm focus:outline-none focus:border-accent/50 transition-all"
                    >
                      <option value="AWS" className="bg-bg text-text">AWS (Amazon Web Services)</option>
                      <option value="GCP" className="bg-bg text-text">Google Cloud Platform (GCP)</option>
                      <option value="Azure" className="bg-bg text-text">Microsoft Azure</option>
                      <option value="Multi-Cloud" className="bg-bg text-text">Multi-Cloud Setup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text text-sm focus:outline-none focus:border-accent/50 transition-all placeholder-text-dim"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-glow transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)] mt-4"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <h2 className="font-display font-bold text-lg text-text">Payment Method</h2>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-accent hover:underline">
                    Edit Company Info
                  </button>
                </div>

                <PaymentMethodSelector
                  value={formData.paymentMethod}
                  onChange={(method) => setFormData((prev) => ({ ...prev, paymentMethod: method }))}
                />

                <div className="flex items-center gap-2 text-xs text-text-dim">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>This site is served over an encrypted (TLS) connection.</span>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request ({price(total)}) <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </form>
        </div>

        {/* Order Preview */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl space-y-4">
            <h3 className="font-display font-bold text-lg text-text">Selected Package</h3>
            {plan && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/8 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                  {plan.category}
                </span>
                <p className="font-display font-bold text-text text-base">{plan.name} Plan</p>
                <p className="text-xs text-text-muted">{plan.tagline}</p>
                <p className="text-sm font-bold text-accent pt-1">{price(plan.priceMonthly)} / month</p>
              </div>
            )}

            {extraItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-dim uppercase tracking-wider">Add-Ons Included</p>
                <div className="text-xs text-text-muted space-y-1">
                  {extraItems.map((item) => (
                    <p key={item.id}>• {item.name} ({price(item.price)}/mo)</p>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-xs text-text-muted">
                <span>Subtotal</span>
                <span>{price(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>GST (18%)</span>
                <span>{price(gst)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text pt-2 border-t border-white/10">
                <span>Total Charge</span>
                <span className="text-accent font-mono text-base">{price(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
