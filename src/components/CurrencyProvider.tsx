'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CURRENCIES, formatCompact, formatPrice, type Currency,
} from '@/lib/currency';

const STORAGE_KEY = 'sid-currency';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** "₹99,000" · "$1,179" */
  price: (amountInr: number) => string;
  /** "₹99K" · "$1.2K" — 0 renders as TBD */
  compact: (amountInr: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // INR on the server and on the first client render alike, so the markup
  // matches during hydration. A saved preference is applied just after mount.
  const [currency, setCurrencyState] = useState<Currency>('INR');

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'USD' || saved === 'INR') setCurrencyState(saved);
      } catch {
        /* storage unavailable — stay on INR */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* preference just won't persist */
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      price: (amountInr: number) => formatPrice(amountInr, currency),
      compact: (amountInr: number) => formatCompact(amountInr, currency),
    }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * Falls back to INR formatting when used outside a provider, so a stray
 * component renders correct rupee prices instead of throwing.
 */
export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (ctx) return ctx;
  return {
    currency: 'INR',
    setCurrency: () => {},
    price: (amountInr: number) => formatPrice(amountInr, 'INR'),
    compact: (amountInr: number) => formatCompact(amountInr, 'INR'),
  };
}

/** Segmented ₹ / $ switch. */
export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5',
        className,
      )}
      role="group"
      aria-label="Display currency"
    >
      {(Object.keys(CURRENCIES) as Currency[]).map((code) => {
        const active = currency === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setCurrency(code)}
            aria-pressed={active}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider transition-all',
              active ? 'bg-white text-black' : 'text-white/55 hover:text-white',
            )}
          >
            {CURRENCIES[code].symbol} {CURRENCIES[code].label}
          </button>
        );
      })}
    </div>
  );
}
