'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          Welcome back!
        </h2>
        <p className="text-sm text-muted mb-6">
          You have been logged in successfully.
        </p>
        <Link
          href="/discover"
          className="inline-block w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold text-center hover:bg-primary-dark transition-colors"
        >
          Go to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted mt-1">
          Log in to your YuhPlace account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
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
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
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
              Logging in...
            </>
          ) : (
            'Log in'
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
