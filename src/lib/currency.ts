/**
 * Currency display for package pricing.
 *
 * Every price in the catalog is stored in INR — that is the billing currency
 * and the source of truth. USD is a *display* conversion applied at render
 * time, so switching currency can never change what a client is actually
 * quoted or charged.
 *
 * Deliberately not applied to paid invoices, order history, or case-study
 * figures: those record what was really billed in rupees, and restating them
 * at today's rate would misrepresent them.
 */

export type Currency = 'INR' | 'USD';

/**
 * Rupees per US dollar. Override per environment with NEXT_PUBLIC_INR_USD_RATE.
 * A fixed rate keeps quotes stable — a live feed would let a total shift
 * underneath a client mid-configuration.
 */
export const INR_PER_USD = Number(process.env.NEXT_PUBLIC_INR_USD_RATE ?? 84);

export const CURRENCIES: Record<Currency, { code: Currency; symbol: string; label: string; locale: string }> = {
  INR: { code: 'INR', symbol: '₹', label: 'INR', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'USD', locale: 'en-US' },
};

/** Convert a stored INR amount into the displayed currency. */
export function convertFromInr(amountInr: number, currency: Currency): number {
  if (currency === 'INR') return amountInr;
  return INR_PER_USD > 0 ? amountInr / INR_PER_USD : amountInr;
}

/** Full amount with grouping: "₹99,000" · "$1,179" */
export function formatPrice(amountInr: number, currency: Currency): string {
  const { symbol, locale } = CURRENCIES[currency];
  const value = convertFromInr(amountInr, currency);
  return symbol + value.toLocaleString(locale, { maximumFractionDigits: 0 });
}

/**
 * Compact amount for dense UI: "₹99K" · "$1.2K".
 * A 0 price means "not priced yet" — show TBD rather than a misleading zero.
 */
export function formatCompact(amountInr: number, currency: Currency): string {
  if (!(amountInr > 0)) return 'TBD';
  const { symbol } = CURRENCIES[currency];
  const value = convertFromInr(amountInr, currency);

  if (value < 1000) return symbol + value.toFixed(0);
  const thousands = value / 1000;
  // One decimal below 10K so "$1.2K" doesn't collapse into a misleading "$1K".
  return symbol + (thousands < 10 ? thousands.toFixed(1) : thousands.toFixed(0)) + 'K';
}

/** Per-year figure from a per-month price, compacted: "₹1,188K/yr" style callouts. */
export function formatCompactAnnual(monthlyInr: number, currency: Currency): string {
  return formatCompact(monthlyInr * 12, currency);
}
