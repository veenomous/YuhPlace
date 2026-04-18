'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2, Home, ShoppingBasket, Wrench, HelpCircle } from 'lucide-react';
import type { HomeServiceType } from '@/types/database';

type ServiceMeta = { label: string; icon: typeof Home; blurb: string };

const SERVICE_META: Record<HomeServiceType, ServiceMeta> = {
  property_viewing: {
    label: 'See a property',
    icon: Home,
    blurb: 'A vetted agent visits the listing and sends you video, photos, and honest notes.',
  },
  grocery_delivery: {
    label: 'Send supplies home',
    icon: ShoppingBasket,
    blurb: 'Groceries, medication, or a barrel — dropped off at the door you choose.',
  },
  handyman: {
    label: 'Hire a trusted hand',
    icon: Wrench,
    blurb: 'Vetted handymen, cleaners, and tradespeople. No WhatsApp runaround.',
  },
  other: {
    label: 'Something else',
    icon: HelpCircle,
    blurb: 'Tell us what you need done in Guyana. We\'ll find the right person.',
  },
};

type Props = {
  open: boolean;
  onClose: () => void;
  defaultService?: HomeServiceType;
  targetPropertyId?: string;
  targetPropertyTitle?: string;
};

export default function HomeServiceRequestModal({
  open,
  onClose,
  defaultService = 'property_viewing',
  targetPropertyId,
  targetPropertyTitle,
}: Props) {
  const [service, setService] = useState<HomeServiceType>(defaultService);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setService(defaultService);
      setError(null);
      setSuccess(false);
    }
  }, [open, defaultService]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/home-services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: service,
          requester_name: name,
          requester_email: email,
          requester_whatsapp: whatsapp || null,
          requester_location: location || null,
          target_property_id: targetPropertyId || null,
          details,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Try again.');
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const meta = SERVICE_META[service];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto"
        style={{ backgroundColor: '#fcf9f8' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between px-5 pt-5 pb-3" style={{ backgroundColor: '#fcf9f8' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(25,106,36,0.1)' }}
            >
              <Icon size={18} style={{ color: '#196a24' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
                {success ? 'Got it — we\'ll be in touch.' : meta.label}
              </h2>
              {!success && (
                <p className="text-[11px]" style={{ color: '#40493d' }}>
                  {targetPropertyTitle ? `For "${targetPropertyTitle}"` : meta.blurb}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={18} style={{ color: '#40493d' }} />
          </button>
        </div>

        {success ? (
          <div className="px-5 pb-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#F1FBF4' }}>
              <CheckCircle2 size={26} style={{ color: '#196a24' }} />
            </div>
            <p className="text-sm mb-1" style={{ color: '#1c1b1b' }}>
              We got your request.
            </p>
            <p className="text-xs mb-5" style={{ color: '#40493d' }}>
              Someone from YuhPlace will reach out to <strong>{email}</strong> within 24 hours. Usually much faster.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm text-white"
              style={{ backgroundColor: '#196a24' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-3">
            {/* Service type chips */}
            {!targetPropertyId && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'rgba(64,73,61,0.6)' }}>
                  What do you need?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(SERVICE_META) as HomeServiceType[]).map((key) => {
                    const m = SERVICE_META[key];
                    const MIcon = m.icon;
                    const active = service === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setService(key)}
                        className="flex items-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all text-left"
                        style={{
                          backgroundColor: active ? '#196a24' : '#fff',
                          color: active ? '#fff' : '#40493d',
                          border: active ? '1px solid #196a24' : '1px solid #e5e2e1',
                        }}
                      >
                        <MIcon size={13} style={{ color: active ? '#a3f69e' : '#196a24' }} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(64,73,61,0.6)' }}>
                Your name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e2e1' }}
                placeholder="Kamini Persaud"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(64,73,61,0.6)' }}>
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2"
                style={{ borderColor: '#e5e2e1' }}
                placeholder="you@email.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(64,73,61,0.6)' }}>
                  WhatsApp
                </label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e2e1' }}
                  placeholder="+1 347 ..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(64,73,61,0.6)' }}>
                  Where are you?
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e2e1' }}
                  placeholder="Queens, NY"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'rgba(64,73,61,0.6)' }}>
                Tell us what you need
              </label>
              <textarea
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: '#e5e2e1' }}
                placeholder={
                  service === 'property_viewing'
                    ? 'When can someone visit? Anything specific you want us to check?'
                    : service === 'grocery_delivery'
                    ? 'What should we drop off, and where in Guyana?'
                    : service === 'handyman'
                    ? 'What needs doing, and where?'
                    : 'Tell us what you need done in Guyana.'
                }
              />
            </div>

            {error && (
              <p className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: '#196a24' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Sending...' : 'Send request'}
            </button>

            <p className="text-[10px] text-center" style={{ color: '#40493d' }}>
              No account needed. We only use your details to follow up on this request.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
