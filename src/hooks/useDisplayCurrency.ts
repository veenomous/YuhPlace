'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DisplayCurrency } from '@/lib/currency';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

const STORAGE_KEY = 'yp:display_currency';
const EVENT_NAME = 'yp:display-currency-changed';

function readStored(): DisplayCurrency {
  if (typeof window === 'undefined') return 'GYD';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (SUPPORTED_CURRENCIES as string[]).includes(raw)) {
      return raw as DisplayCurrency;
    }
  } catch {
    // ignore storage failures (Safari private mode, etc.)
  }
  // Auto-default for likely diaspora locales.
  const lang = window.navigator.language || '';
  if (/^en-(CA)/i.test(lang)) return 'CAD';
  if (/^en-(GB|UK)/i.test(lang)) return 'GBP';
  if (/^en-(US)/i.test(lang)) return 'USD';
  return 'GYD';
}

export function useDisplayCurrency(): [DisplayCurrency, (next: DisplayCurrency) => void] {
  const [currency, setCurrency] = useState<DisplayCurrency>('GYD');

  useEffect(() => {
    setCurrency(readStored());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DisplayCurrency>).detail;
      if (detail && (SUPPORTED_CURRENCIES as string[]).includes(detail)) {
        setCurrency(detail);
      }
    };
    window.addEventListener(EVENT_NAME, handler);
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && (SUPPORTED_CURRENCIES as string[]).includes(e.newValue)) {
        setCurrency(e.newValue as DisplayCurrency);
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const update = useCallback((next: DisplayCurrency) => {
    setCurrency(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent<DisplayCurrency>(EVENT_NAME, { detail: next }));
  }, []);

  return [currency, update];
}
