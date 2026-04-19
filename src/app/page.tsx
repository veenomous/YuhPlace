'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Home,
  ShoppingBasket,
  Wrench,
  ShieldCheck,
  Plane,
  Building2,
  MapPin,
  Bell,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import HomeServiceRequestModal from '@/components/HomeServiceRequestModal';
import NewsletterSignup from '@/components/NewsletterSignup';
import type { HomeServiceType } from '@/types/database';

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardFade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceChoice, setServiceChoice] = useState<HomeServiceType>('property_viewing');

  function openService(s: HomeServiceType) {
    setServiceChoice(s);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcf9f8', color: '#1c1b1b' }}>

      {/* ── TopNav ── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl shadow-sm" style={{ backgroundColor: 'rgba(252,249,248,0.85)' }}>
        <div className="flex justify-between items-center px-4 sm:px-6 h-12 sm:h-14 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="YuhPlace" className="h-5 sm:h-6" />
            <div className="hidden sm:flex gap-4">
              {[
                { label: 'Services', href: '/home-services' },
                { label: 'Property', href: '/property' },
                { label: 'Market', href: '/market' },
                { label: 'Discover', href: '/discover' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-xs font-semibold tracking-tight transition-colors hover:text-[#196a24]"
                  style={{ color: '#40493d', fontFamily: 'var(--font-headline)' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/notifications" className="p-1.5 rounded-full transition-all hover:bg-[#ebe7e7]/50">
              <Bell size={16} style={{ color: '#40493d' }} />
            </Link>
            {!loading && (
              user ? (
                <Link href="/profile" className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#e5e2e1' }}>
                  <span className="text-[10px] font-bold" style={{ color: '#196a24' }}>
                    {(user.user_metadata?.name || user.email || '?')[0].toUpperCase()}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link href="/login" className="px-2.5 py-1 text-xs font-semibold hover:text-[#196a24] transition-colors" style={{ color: '#40493d' }}>Log in</Link>
                  <Link href="/signup" className="px-3 py-1 text-xs font-bold text-white rounded-md hover:brightness-110 transition-colors" style={{ backgroundColor: '#196a24' }}>Sign up</Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="pt-12 sm:pt-14">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden px-4 sm:px-6 pt-6 pb-10 sm:pt-12 sm:pb-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            <motion.div className="md:col-span-7 z-10" initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold mb-4 tracking-widest uppercase" style={{ backgroundColor: '#F1FBF4', color: '#196a24' }}>
                <Plane size={10} /> For the Guyanese diaspora
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
                Home, from<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #196a24, #36843a)' }}>
                  wherever yuh deh.
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-sm sm:text-base max-w-lg mb-6 leading-relaxed" style={{ color: '#40493d' }}>
                You in Queens, Toronto, or London. Family still back home in Guyana. YuhPlace sends somebody yuh can trust &mdash; to see a property, drop off supplies, or fix what needs fixing.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                <button
                  onClick={() => openService('property_viewing')}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-sm hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: '#196a24' }}
                >
                  Send somebody <ArrowRight size={14} />
                </button>
                <Link
                  href="/home-services"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#f0edec', color: '#1c1b1b' }}
                >
                  How it works
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-5 flex items-center gap-4 text-[11px]" style={{ color: '#40493d' }}>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} style={{ color: '#196a24' }} /> Pay after the job&rsquo;s done
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} style={{ color: '#196a24' }} /> Vetted partners only
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className="md:col-span-5 relative h-[240px] sm:h-[320px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 rounded-2xl -rotate-3 -z-10" style={{ backgroundColor: '#f6f3f2' }} />
              <div className="absolute inset-3 rounded-xl overflow-hidden shadow-lg rotate-2 transition-transform hover:rotate-0 duration-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" alt="Home in Guyana" src="/Georgetown.png" />
              </div>
              <div className="absolute -bottom-3 -left-3 p-3 rounded-xl shadow-lg max-w-[200px]" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F1FBF4' }}>
                    <ShieldCheck size={12} style={{ color: '#196a24' }} />
                  </div>
                  <p className="text-[10px] font-bold" style={{ color: '#196a24' }}>Verified Partner</p>
                </div>
                <p className="font-bold text-[11px] leading-tight mb-0.5" style={{ fontFamily: 'var(--font-headline)' }}>
                  Property viewing in Georgetown
                </p>
                <p className="text-[10px]" style={{ color: '#40493d' }}>Video sent in 48 hours</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── THREE SERVICES ── */}
        <section className="py-10 sm:py-14 px-4 sm:px-6" style={{ backgroundColor: '#f6f3f2' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: '#196a24' }}>
                  Three things we do
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none" style={{ fontFamily: 'var(--font-headline)' }}>
                  Send home what they need.
                </h2>
              </motion.div>
              <motion.p variants={fadeUp} className="text-xs sm:text-sm max-w-xs" style={{ color: '#40493d' }}>
                One form. One trusted person. Proof at every step.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
            >
              {/* Property viewing */}
              <motion.button
                variants={cardFade}
                onClick={() => openService('property_viewing')}
                className="text-left p-5 rounded-2xl transition-all hover:shadow-lg active:scale-[0.99] flex flex-col h-full min-h-[220px]"
                style={{ backgroundColor: '#fcf9f8' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#F1FBF4' }}>
                  <Home size={20} style={{ color: '#196a24' }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>See a property</h3>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: '#40493d' }}>
                  Buying or renting from abroad? A vetted agent walks the listing and sends video, photos, and honest notes.
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#196a24' }}>
                  Request a viewing <ArrowRight size={12} />
                </span>
              </motion.button>

              {/* Grocery delivery */}
              <motion.button
                variants={cardFade}
                onClick={() => openService('grocery_delivery')}
                className="text-left p-5 rounded-2xl transition-all hover:shadow-lg active:scale-[0.99] flex flex-col h-full min-h-[220px] text-white"
                style={{ background: 'linear-gradient(135deg, #196a24, #36843a)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <ShoppingBasket size={20} style={{ color: '#f1e340' }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>Send supplies home</h3>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: '#a3f69e' }}>
                  Tell us what Mom needs. We shop at a real supermarket in Guyana, drop it at her door, and send you the receipt.
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#f1e340' }}>
                  Send a delivery <ArrowRight size={12} />
                </span>
              </motion.button>

              {/* Handyman */}
              <motion.button
                variants={cardFade}
                onClick={() => openService('handyman')}
                className="text-left p-5 rounded-2xl transition-all hover:shadow-lg active:scale-[0.99] flex flex-col h-full min-h-[220px]"
                style={{ backgroundColor: '#1c1b1b', color: '#fcf9f8' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <Wrench size={20} style={{ color: '#a3f69e' }} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-headline)' }}>Hire a trusted hand</h3>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: '#e5e2e1' }}>
                  Fix the gate. Clean the yard. Check on Auntie. Vetted handymen, cleaners, and tradespeople &mdash; no WhatsApp runaround.
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#a3f69e' }}>
                  Hire somebody <ArrowRight size={12} />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ── PROPERTY FEATURE (real-estate partner) ── */}
        <section className="py-10 sm:py-14 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center">
            <motion.div
              className="md:col-span-5 relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 rounded-2xl rotate-2" style={{ backgroundColor: '#f0edec' }}>
                <div className="rounded-xl overflow-hidden h-[240px] sm:h-[320px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt="Property in Georgetown" src="/Georgetownstreet.png" />
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#fcf9f8' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#196a24' }} />
                  <span className="text-[10px] font-bold" style={{ color: '#196a24' }}>LIVE</span>
                </div>
                <p className="text-[11px] font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
                  New listings this week
                </p>
              </div>
            </motion.div>

            <motion.div className="md:col-span-7" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: '#196a24' }}>
                Property, the right way
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
                Browse listings. Tour from abroad.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm leading-relaxed mb-5 max-w-lg" style={{ color: '#40493d' }}>
                Every property on YuhPlace can be toured by a real person &mdash; not a filter, not a stock photo. Working with Guyanese real-estate partners who know the neighbourhoods, not just the MLS.
              </motion.p>
              <motion.div variants={fadeUp} className="space-y-2 mb-5">
                {[
                  'Verified partners with real reviews on every listing',
                  'Request a viewing in one tap &mdash; video in 48 hours',
                  'Rent, buy, or inherit &mdash; guided from wherever yuh deh',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 text-xs" style={{ color: '#1c1b1b' }}>
                    <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#196a24' }} />
                    <span dangerouslySetInnerHTML={{ __html: line }} />
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                <Link
                  href="/property"
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2"
                  style={{ backgroundColor: '#196a24' }}
                >
                  <Building2 size={14} /> Browse properties
                </Link>
                <button
                  onClick={() => openService('property_viewing')}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#f0edec', color: '#1c1b1b' }}
                >
                  Request a viewing
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── ALSO ON YUHPLACE (soft surface the rest) ── */}
        <section className="py-10 sm:py-12 px-4 sm:px-6" style={{ backgroundColor: '#1c1b1b', color: '#fcf9f8' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-xl sm:text-2xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-headline)' }}>
                Also on YuhPlace
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xs" style={{ color: '#e5e2e1' }}>
                Back home? The community side is here too.
              </motion.p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/market" className="group p-4 rounded-2xl transition-all hover:scale-[1.01]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <ShoppingBag size={18} className="mb-2" style={{ color: '#a3f69e' }} />
                <h3 className="text-sm font-bold mb-0.5" style={{ fontFamily: 'var(--font-headline)' }}>Market</h3>
                <p className="text-[11px]" style={{ color: '#e5e2e1' }}>Buy, sell, or swap with neighbours.</p>
              </Link>
              <Link href="/discover" className="group p-4 rounded-2xl transition-all hover:scale-[1.01]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <MapPin size={18} className="mb-2" style={{ color: '#a3f69e' }} />
                <h3 className="text-sm font-bold mb-0.5" style={{ fontFamily: 'var(--font-headline)' }}>Discover</h3>
                <p className="text-[11px]" style={{ color: '#e5e2e1' }}>Local news, alerts, and events.</p>
              </Link>
              <Link href="/home-services" className="group p-4 rounded-2xl transition-all hover:scale-[1.01]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <Plane size={18} className="mb-2" style={{ color: '#a3f69e' }} />
                <h3 className="text-sm font-bold mb-0.5" style={{ fontFamily: 'var(--font-headline)' }}>Home Services</h3>
                <p className="text-[11px]" style={{ color: '#e5e2e1' }}>From abroad? Start here.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-10 sm:py-14 px-4 sm:px-6" style={{ backgroundColor: '#fcf9f8' }}>
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{ backgroundColor: '#ebe7e7' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(circle at 50% 50%, #196a24 0%, transparent 60%)' }} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter mb-3 relative z-10" style={{ fontFamily: 'var(--font-headline)' }}>
                Got somebody back home?
              </h2>
              <p className="text-sm max-w-md mx-auto mb-6 relative z-10" style={{ color: '#40493d' }}>
                Send a request in one minute. No account. No commitment. We&rsquo;ll come back to yuh within a day.
              </p>
              <div className="flex flex-wrap justify-center gap-3 relative z-10">
                <button
                  onClick={() => openService('property_viewing')}
                  className="px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2"
                  style={{ backgroundColor: '#196a24' }}
                >
                  Start a request <ArrowRight size={14} />
                </button>
                <Link href="/home-services" className="px-5 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: '#fcf9f8', color: '#1c1b1b' }}>
                  See all services
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-4 sm:px-6 pb-6 sm:pb-8" style={{ backgroundColor: '#fcf9f8' }}>
          <div className="max-w-5xl mx-auto pt-8 sm:pt-10 grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ borderTop: '1px solid rgba(191,202,186,0.2)' }}>
            <div className="col-span-2 sm:col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="YuhPlace" className="h-5 mb-3" />
              <p className="text-[11px] leading-relaxed" style={{ color: '#40493d' }}>
                Bridging the Guyanese diaspora and home. Built for family.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>Services</h5>
              <ul className="space-y-2 text-[11px]" style={{ color: '#40493d' }}>
                <li><button onClick={() => openService('property_viewing')} className="hover:text-[#196a24] transition-colors text-left">Property viewing</button></li>
                <li><button onClick={() => openService('grocery_delivery')} className="hover:text-[#196a24] transition-colors text-left">Supplies delivery</button></li>
                <li><button onClick={() => openService('handyman')} className="hover:text-[#196a24] transition-colors text-left">Trusted handyman</button></li>
                <li><Link href="/home-services" className="hover:text-[#196a24] transition-colors">All services</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold mb-3" style={{ fontFamily: 'var(--font-headline)' }}>On-ground</h5>
              <ul className="space-y-2 text-[11px]" style={{ color: '#40493d' }}>
                <li><Link href="/property" className="hover:text-[#196a24] transition-colors">Property listings</Link></li>
                <li><Link href="/market" className="hover:text-[#196a24] transition-colors">Marketplace</Link></li>
                <li><Link href="/discover" className="hover:text-[#196a24] transition-colors">Local updates</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold mb-2" style={{ fontFamily: 'var(--font-headline)' }}>GT This Week</h5>
              <p className="text-[11px] mb-2 leading-relaxed" style={{ color: '#40493d' }}>
                News from home, top property drops, and what yuh people dem saying. One email, every Sunday.
              </p>
              <NewsletterSignup source="landing_footer" variant="light" />
              <ul className="space-y-1.5 text-[11px] mt-3" style={{ color: '#40493d' }}>
                <li><Link href="/about" className="hover:text-[#196a24] transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-[#196a24] transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-[#196a24] transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-[#196a24] transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] pt-4 max-w-5xl mx-auto" style={{ color: '#40493d', borderTop: '1px solid rgba(191,202,186,0.2)' }}>
            <p>&copy; {new Date().getFullYear()} YuhPlace. Built in Guyana, for Guyana &amp; wherever yuh deh.</p>
          </div>
        </footer>
      </main>

      <HomeServiceRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService={serviceChoice}
      />
    </div>
  );
}
