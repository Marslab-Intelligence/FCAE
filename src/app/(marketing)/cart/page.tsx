'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Trash2, Shield, Check, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyProvider';
import { getPlan, type PlanId } from '@/lib/package-catalog';
import {
  readBuilderSelection,
  removeExtraFromBuilderSelection,
  resolveFullSelection,
  type SelectedItem,
} from '@/lib/builder-cart';

export default function CartPage() {
  const { price } = useCurrency();
  const [hydrated, setHydrated] = useState(false);
  const [planId, setPlanId] = useState<PlanId | null>(null);
  const [extras, setExtras] = useState<SelectedItem[]>([]);

  // Reads localStorage after mount so SSR output matches the first client
  // render (no localStorage on the server) — same pattern PackageBuilder uses.
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
  const customItems = fullSelection.filter((s) => s.custom);

  const removeExtra = (id: string) => {
    setExtras(removeExtraFromBuilderSelection(id));
  };

  const addOnsTotal = extraItems.reduce((sum, s) => sum + s.price, 0);
  const subtotalMonthly = (plan?.priceMonthly ?? 0) + addOnsTotal;
  const gstRate = 0.18;
  const gst = subtotalMonthly * gstRate;
  const totalDueToday = subtotalMonthly + gst;

  const isEmpty = hydrated && !plan;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center justify-center">
    <div className="w-full max-w-7xl mx-auto" data-audit="content-block">
      {/* Breadcrumb & Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs text-text-dim mb-4">
          <Link href="/" className="hover:text-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text font-medium">Cart & Selection</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-text">Your Service Package</h1>
            <p className="text-text-muted text-sm mt-0.5">Review your selected cloud managed tier and add-ons before checkout</p>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-text-dim">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-text mb-2">Your cart is empty</h2>
          <p className="text-text-muted text-sm mb-6">Configure a package in the builder, or explore our plans to get started.</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/build"
              className="px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-glow transition-all text-sm shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)]"
            >
              Open Package Builder
            </Link>
            <Link
              href="/plans"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text font-semibold hover:bg-white/10 transition-all text-sm"
            >
              Explore Plans
            </Link>
          </div>
        </motion.div>
      ) : !plan ? null : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-text-dim">
                <span>Item & Scope</span>
                <span>Billing</span>
              </div>

              {/* Base Tier — not individually removable; change it in the builder */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20">
                    Core Service Tier
                  </span>
                  <h3 className="font-display font-bold text-base text-text">{plan.name} Managed Cloud Plan</h3>
                  <p className="text-xs text-text-muted">{price(plan.priceMonthly)} <span className="text-text-dim">/month</span></p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                  <p className="font-display font-bold text-text text-base">{price(plan.priceMonthly)}</p>
                  <Link
                    href={`/build?plan=${plan.id}`}
                    className="text-[11px] text-accent hover:underline whitespace-nowrap"
                  >
                    Change tier
                  </Link>
                </div>
              </div>

              {extraItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-white/15"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/20">
                      {item.categoryLabel}
                    </span>
                    <h3 className="font-display font-bold text-base text-text">{item.name}</h3>
                    <p className="text-xs text-text-muted">
                      {price(item.price)} <span className="text-text-dim">/month</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    <p className="font-display font-bold text-text text-base">{price(item.price)}</p>
                    <button
                      onClick={() => removeExtra(item.id)}
                      className="p-2 rounded-xl hover:bg-red-500/15 hover:text-red-400 text-text-dim transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-cyan/5 border border-cyan/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan/15 text-cyan border border-cyan/25">
                      Custom Request
                    </span>
                    <h3 className="font-display font-bold text-base text-text">{item.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    <p className="font-display font-bold text-cyan text-sm">Scoped on call</p>
                    <button
                      onClick={() => removeExtra(item.id)}
                      className="p-2 rounded-xl hover:bg-red-500/15 hover:text-red-400 text-text-dim transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Value Callout */}
            <div className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-4">
              <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-text text-sm">30-Day Onboarding Guarantee Included</h4>
                <p className="text-text-muted leading-relaxed">
                  Full SLA coverage starts from Day 1. If we don&apos;t complete initial audit & runbook setup within 14 business days, your first month is 50% off.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl sticky top-32 space-y-6">
              <h2 className="font-display font-bold text-xl text-text">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-muted">
                  <span>Base Tier ({plan.name})</span>
                  <span className="font-mono text-text">{price(plan.priceMonthly)}/mo</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Add-Ons ({extraItems.length})</span>
                  <span className="font-mono text-text">{extraItems.length > 0 ? `${price(addOnsTotal)}/mo` : '—'}</span>
                </div>
                {customItems.length > 0 && (
                  <div className="flex justify-between text-cyan">
                    <span>Custom Requests ({customItems.length})</span>
                    <span>To be priced</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted">
                  <span>GST (18%)</span>
                  <span className="font-mono text-text">{price(gst)}</span>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                  <div>
                    <p className="font-display font-bold text-lg text-text">Total Due Today</p>
                    <p className="text-[11px] text-text-dim">Includes 1st month + GST</p>
                  </div>
                  <span className="font-display font-bold text-2xl text-accent">
                    {price(totalDueToday)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-linear-to-r from-accent to-purple-600 text-white font-bold hover:from-accent-glow hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)] transition-all"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 space-y-2 text-xs text-text-dim">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cancel or modify tier anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GST Invoice generated instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>24/7 Priority Support included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
