// Currency conversion for the diaspora-first audience.
//
// Rates are expressed per 1 USD. Update manually when they drift
// — no live FX dependency yet.

export type DisplayCurrency = 'GYD' | 'USD' | 'CAD' | 'GBP';

export const SUPPORTED_CURRENCIES: DisplayCurrency[] = ['GYD', 'USD', 'CAD', 'GBP'];

export const CURRENCY_LABELS: Record<DisplayCurrency, string> = {
  GYD: 'GYD',
  USD: 'USD',
  CAD: 'CAD',
  GBP: 'GBP',
};

export const CURRENCY_SYMBOLS: Record<DisplayCurrency, string> = {
  GYD: 'G$',
  USD: '$',
  CAD: 'C$',
  GBP: '£',
};

// Units per 1 USD. Update when rates drift meaningfully.
const FX_PER_USD: Record<DisplayCurrency, number> = {
  USD: 1,
  GYD: 209,
  CAD: 1.38,
  GBP: 0.79,
};

export function convert(
  amount: number,
  from: string | null | undefined,
  to: DisplayCurrency,
): number {
  const src = normalizeCurrency(from);
  if (src === to) return amount;
  const usd = amount / FX_PER_USD[src];
  return usd * FX_PER_USD[to];
}

export function normalizeCurrency(raw: string | null | undefined): DisplayCurrency {
  if (!raw) return 'GYD';
  const upper = raw.toUpperCase();
  return (SUPPORTED_CURRENCIES as string[]).includes(upper) ? (upper as DisplayCurrency) : 'GYD';
}

export function formatMoney(amount: number, currency: DisplayCurrency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  // GYD shows whole units. Diaspora currencies show up to 0 decimals on big
  // property prices (more readable) and 2 decimals under 100 (e.g. fees).
  const decimals = currency === 'GYD' ? 0 : amount < 100 ? 2 : 0;
  const rounded = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : '—';
  return `${symbol}${rounded}`;
}

export function formatPriceIn(
  amount: number | null | undefined,
  sourceCurrency: string | null | undefined,
  target: DisplayCurrency,
): string {
  if (amount === null || amount === undefined) return 'Contact for price';
  const converted = convert(amount, sourceCurrency, target);
  return `${formatMoney(converted, target)} ${target}`;
}
