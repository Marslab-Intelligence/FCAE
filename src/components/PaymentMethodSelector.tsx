'use client';

import { Building2, Clock, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'netbanking';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/**
 * Payment collection is deferred until Razorpay is wired up (see AGENTS.md
 * lifecycle notes) — this renders a disabled/placeholder state so no raw
 * card fields ever exist in our DOM. Once Razorpay Checkout.js is ready to
 * drop in, this becomes the component that mounts it and no other file in
 * the checkout flow needs to change.
 */
export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('card')}
          className={cn(
            'p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all',
            value === 'card' ? 'border-accent bg-accent/10 text-text' : 'border-white/10 bg-white/5 text-text-muted'
          )}
        >
          <CreditCard className="w-5 h-5 text-accent" />
          <span className="text-xs font-bold">Credit / Debit Card</span>
          <span className="text-[10px] text-text-dim">Visa, Mastercard, Amex</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('netbanking')}
          className={cn(
            'p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all',
            value === 'netbanking' ? 'border-accent bg-accent/10 text-text' : 'border-white/10 bg-white/5 text-text-muted'
          )}
        >
          <Building2 className="w-5 h-5 text-accent" />
          <span className="text-xs font-bold">Corporate NetBanking / NEFT</span>
          <span className="text-[10px] text-text-dim">HDFC, ICICI, SBI, Axis</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/8 flex items-center gap-3 text-text-muted">
        <Clock className="w-5 h-5 text-accent shrink-0" />
        <div>
          <p className="text-xs font-semibold text-text">Online payment coming soon</p>
          <p className="text-[11px] text-text-dim mt-0.5">
            Card and NetBanking checkout via Razorpay is being finalized. Submit your details below and our team
            will follow up to complete onboarding and billing.
          </p>
        </div>
      </div>
    </div>
  );
}
