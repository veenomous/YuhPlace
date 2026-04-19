'use client';

import { useState } from 'react';
import { Loader2, Check, ArrowRight } from 'lucide-react';

type Variant = 'light' | 'dark';

type Props = {
  source?: string;
  variant?: Variant;
  className?: string;
};

export default function NewsletterSignup({ source = 'landing_footer', variant = 'light', className }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === 'dark';

  if (done) {
    return (
      <div
        className={className}
        style={{
          padding: '10px 12px',
          borderRadius: 12,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1FBF4',
          color: isDark ? '#a3f69e' : '#196a24',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Check size={14} /> Yuh on the list. See yuh Sunday.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        className="flex rounded-lg p-0.5"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f6f3f2',
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="flex-1 bg-transparent border-none focus:outline-none text-[12px] px-2.5 py-1.5"
          style={{ color: isDark ? '#fcf9f8' : '#1c1b1b' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 disabled:opacity-60"
          style={{ backgroundColor: '#196a24', color: '#ffffff' }}
          aria-label="Subscribe"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
        </button>
      </div>
      {error && (
        <p className="text-[10px] mt-1" style={{ color: isDark ? '#fca5a5' : '#B91C1C' }}>
          {error}
        </p>
      )}
    </form>
  );
}
