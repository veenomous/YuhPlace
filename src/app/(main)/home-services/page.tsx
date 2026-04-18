'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  ShoppingBasket,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  HelpCircle,
} from 'lucide-react';
import HomeServiceRequestModal from '@/components/HomeServiceRequestModal';
import type { HomeServiceType } from '@/types/database';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const SERVICES: Array<{
  key: HomeServiceType;
  title: string;
  oneLiner: string;
  description: string;
  icon: typeof Home;
  accent: string;
  accentLight: string;
  bullets: string[];
}> = [
  {
    key: 'property_viewing',
    title: 'See a property',
    oneLiner: 'Buying or renting from abroad? Don\'t fly blind.',
    description:
      'A vetted YuhPlace agent visits any listing on your behalf and sends you video, photos, and honest notes. Check the plumbing. Check the neighbours. Check if it really has that view.',
    icon: Home,
    accent: '#196a24',
    accentLight: '#F1FBF4',
    bullets: [
      'Walk-through video within 48 hours',
      'Honest write-up — flaws included',
      'Optional follow-up call with the agent',
    ],
  },
  {
    key: 'grocery_delivery',
    title: 'Send supplies home',
    oneLiner: 'Drop off groceries, medicine, or a barrel — from anywhere.',
    description:
      'Tell us what Mom needs. We shop at a real supermarket in Guyana and deliver to her door. Receipts included so you know exactly what you paid for.',
    icon: ShoppingBasket,
    accent: '#F2B134',
    accentLight: '#FFF8E7',
    bullets: [
      'Real receipts, no markup games',
      'Same-day delivery in Georgetown',
      'Barrels and large orders welcome',
    ],
  },
  {
    key: 'handyman',
    title: 'Hire a trusted hand',
    oneLiner: 'Fix the gate. Clean the yard. Check on Auntie.',
    description:
      'Every tradesperson is interviewed, photographed, and rated. No more sending money to a cousin\'s cousin and hoping. Electricians, plumbers, cleaners, drivers — vetted.',
    icon: Wrench,
    accent: '#1667B7',
    accentLight: '#EFF6FF',
    bullets: [
      'Faces and reviews on every hand',
      'Pay after the work is done',
      'Photo proof before you release payment',
    ],
  },
];

export default function HomeServicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceChoice, setServiceChoice] = useState<HomeServiceType>('property_viewing');

  function openFor(key: HomeServiceType) {
    setServiceChoice(key);
    setModalOpen(true);
  }

  return (
    <div className="-mx-4" style={{ width: 'calc(100% + 2rem)' }}>
      {/* Hero */}
      <section
        className="relative px-4 sm:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14 overflow-hidden"
        style={{ backgroundColor: '#fcf9f8' }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold mb-4 tracking-widest uppercase"
              style={{ backgroundColor: '#F1FBF4', color: '#196a24' }}
            >
              <ShieldCheck size={10} /> For the Guyanese diaspora
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-5xl font-black tracking-tighter leading-[0.95] mb-4"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Home, from<br />
              <span style={{ color: '#196a24' }}>wherever yuh deh.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm sm:text-base max-w-xl leading-relaxed mb-6" style={{ color: '#40493d' }}>
              You in Queens, Toronto, or London. Family still back home in Georgetown, Berbice, or Linden. YuhPlace sends someone you can trust — to see a property, drop off supplies, or fix what needs fixing.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
              <button
                onClick={() => openFor('property_viewing')}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2"
                style={{ backgroundColor: '#196a24' }}
              >
                Start a request <ArrowRight size={14} />
              </button>
              <a
                href="#how-it-works"
                className="px-4 py-2.5 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#f0edec', color: '#1c1b1b' }}
              >
                How it works
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Service cards */}
      <section className="px-4 sm:px-8 py-8 sm:py-10" style={{ backgroundColor: '#f6f3f2' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.key}
                  variants={fadeUp}
                  onClick={() => openFor(s.key)}
                  className="text-left p-5 rounded-2xl flex flex-col h-full transition-all hover:shadow-lg active:scale-[0.99]"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: s.accentLight }}
                  >
                    <Icon size={18} style={{ color: s.accent }} />
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
                    {s.title}
                  </h3>
                  <p className="text-xs font-semibold mb-2" style={{ color: s.accent }}>
                    {s.oneLiner}
                  </p>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: '#40493d' }}>
                    {s.description}
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[11px]" style={{ color: '#40493d' }}>
                        <ShieldCheck size={12} className="flex-shrink-0 mt-0.5" style={{ color: s.accent }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <span
                    className="mt-auto inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: s.accent }}
                  >
                    Request this <ArrowRight size={12} />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 sm:px-8 py-10 sm:py-14" style={{ backgroundColor: '#fcf9f8' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: '#196a24' }}>
              How it works
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-black tracking-tighter mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
              Three steps, no runaround.
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: '01', title: 'Tell we what you need', desc: 'A short form. No account required. Takes a minute.', Icon: HelpCircle },
                { n: '02', title: 'We match a trusted hand', desc: 'A vetted YuhPlace partner picks it up. You get their name and face.', Icon: Users },
                { n: '03', title: 'Job done, proof sent', desc: 'Video, photos, receipts — everything documented. Then you pay.', Icon: Clock },
              ].map(({ n, title, desc, Icon }) => (
                <motion.div
                  key={n}
                  variants={fadeUp}
                  className="p-5 rounded-2xl"
                  style={{ backgroundColor: '#f6f3f2' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black" style={{ color: '#196a24' }}>{n}</span>
                    <Icon size={14} style={{ color: '#196a24' }} />
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#40493d' }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust row */}
      <section className="px-4 sm:px-8 py-8" style={{ backgroundColor: '#1c1b1b', color: '#fcf9f8' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Pay when it\'s done', desc: 'Never pay strangers up front. Release payment after you see proof.' },
            { label: 'Verified people only', desc: 'Every partner interviewed, photographed, and rated on YuhPlace.' },
            { label: 'One contact point', desc: 'We handle the back-and-forth so you\'re not stuck on WhatsApp at 2am.' },
          ].map((t) => (
            <div key={t.label} className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>{t.label}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: '#e5e2e1' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 py-10 sm:py-12" style={{ backgroundColor: '#fcf9f8' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter mb-3" style={{ fontFamily: 'var(--font-headline)' }}>
            Ready to send somebody?
          </h2>
          <p className="text-sm max-w-md mx-auto mb-5" style={{ color: '#40493d' }}>
            One form. We&rsquo;ll be back to you within a day &mdash; usually faster.
          </p>
          <button
            onClick={() => openFor('property_viewing')}
            className="px-5 py-3 rounded-xl font-bold text-sm text-white inline-flex items-center gap-2"
            style={{ backgroundColor: '#196a24' }}
          >
            Start a request <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <HomeServiceRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService={serviceChoice}
      />
    </div>
  );
}
