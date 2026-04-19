'use client';

import { SUPPORTED_CURRENCIES, type DisplayCurrency } from '@/lib/currency';
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md';

export default function CurrencySwitcher({
  size = 'sm',
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const [currency, setCurrency] = useDisplayCurrency();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-0.5',
        className,
      )}
      style={{ backgroundColor: '#f0edec' }}
      role="radiogroup"
      aria-label="Display currency"
    >
      {SUPPORTED_CURRENCIES.map((c) => {
        const active = c === currency;
        return (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c as DisplayCurrency)}
            role="radio"
            aria-checked={active}
            className={cn(
              'rounded-full font-bold tracking-wide transition-colors',
              padding,
            )}
            style={{
              backgroundColor: active ? '#196a24' : 'transparent',
              color: active ? '#ffffff' : '#40493d',
            }}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
