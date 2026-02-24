'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle,
  Loader2,
  UserCircle,
  Briefcase,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { AccountType } from '@/types/database';

const COUNTRY_CODES = [
  { code: '+592', label: 'GY +592', flag: '🇬🇾' },
  { code: '+1', label: 'US/CA +1', flag: '🇺🇸' },
  { code: '+44', label: 'UK +44', flag: '🇬🇧' },
  { code: '+1-868', label: 'TT +1-868', flag: '🇹🇹' },
  { code: '+1-246', label: 'BB +1-246', flag: '🇧🇧' },
  { code: '+597', label: 'SR +597', flag: '🇸🇷' },
];

const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  description: string;
  icon: typeof UserCircle;
}[] = [
  {
    value: 'individual',
    label: 'Individual',
    description: 'Personal account for buying, selling, and community',
    icon: UserCircle,
  },
  {
    value: 'business',
    label: 'Business',
    description: 'For shops, restaurants, and local businesses',
    icon: Briefcase,
  },
  {
    value: 'agent_landlord',
    label: 'Agent / Landlord',
    description: 'For property agents and landlords',
    icon: Building2,
  },
];

function SignupForm() {
  const { signUp } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+592');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const { error: authError } = await signUp(email, password, name, {
      account_type: accountType,
      phone: phone ? `${countryCode}${phone}` : '',
    });
    setIsLoading(false);

    if (authError) {
      setError(authError);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          Account created!
        </h2>
        <p className="text-sm text-muted mb-6">
          Welcome to YuhPlace, {name.split(' ')[0]}. Check your email to confirm your account.
        </p>
        <Link
          href="/login"
          className="inline-block w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold text-center hover:bg-primary-dark transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground">Join YuhPlace</h1>
        <p className="text-sm text-muted mt-1">
          Create your account and connect with Guyana
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            Full Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            Password <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Account Type selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = accountType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAccountType(type.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center',
                    isSelected
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-surface hover:border-primary/40',
                  )}
                >
                  <Icon
                    size={22}
                    className={cn(
                      isSelected ? 'text-primary' : 'text-muted',
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-semibold leading-tight',
                      isSelected ? 'text-primary-dark' : 'text-foreground',
                    )}
                  >
                    {type.label}
                  </span>
                  <span className="text-[10px] text-muted leading-tight hidden sm:block">
                    {type.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone (optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
            Phone <span className="text-xs text-muted font-normal">(optional)</span>
          </label>
          <div className="relative flex">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="appearance-none rounded-l-xl border border-r-0 border-border bg-white pl-3 pr-7 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={countryCode === '+592' ? '600 0000' : 'Phone number'}
                className="w-full pl-10 pr-4 py-2.5 rounded-r-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-danger font-medium">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{' '}
        <Link href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
