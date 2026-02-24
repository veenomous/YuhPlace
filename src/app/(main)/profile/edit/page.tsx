'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { REGIONS } from '@/lib/constants';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [region, setRegion] = useState(profile?.region_id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user || !profile) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted text-sm">Please sign in to edit your profile.</p>
      </div>
    );
  }

  const isFormValid = name.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    const supabase = createClient();
    const { error } = await supabase.rpc('update_profile', {
      p_name: name.trim(),
      p_phone: phone.trim() || null,
      p_region_slug: region || null,
    });

    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }

    await refreshProfile();
    setSuccess(true);
    setTimeout(() => router.push('/profile'), 800);
  }

  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface hover:bg-border transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-dark">
            {name.trim()
              ? name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : '?'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+592 000 0000"
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Region */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select a region</option>
            {REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Email</label>
          <input
            type="email"
            value={user.email ?? ''}
            disabled
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">Email cannot be changed</p>
        </div>

        {/* Account type (read-only) */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Account Type</label>
          <input
            type="text"
            value={profile.account_type === 'agent_landlord' ? 'Agent / Landlord' : profile.account_type.charAt(0).toUpperCase() + profile.account_type.slice(1)}
            disabled
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-muted cursor-not-allowed capitalize"
          />
          <p className="text-xs text-muted mt-1">Account type cannot be changed</p>
        </div>

        {submitError && (
          <div className="px-4 py-3 bg-danger-light border border-danger/20 rounded-xl">
            <p className="text-sm text-danger">{submitError}</p>
          </div>
        )}

        {success && (
          <div className="px-4 py-3 bg-primary-light border border-primary/20 rounded-xl">
            <p className="text-sm text-primary-dark">Profile updated!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className={cn(
            'w-full py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2',
            isFormValid && !submitting
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-border text-muted cursor-not-allowed',
          )}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
}
