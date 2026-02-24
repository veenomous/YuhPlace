'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Calendar, Briefcase, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { REGIONS } from '@/lib/constants';
import type { PostType } from '@/types/database';

const POST_TYPES: { value: PostType; label: string; icon: typeof AlertTriangle; activeClasses: string }[] = [
  { value: 'alert', label: 'Alert', icon: AlertTriangle, activeClasses: 'bg-danger-light text-danger border-danger' },
  { value: 'event', label: 'Event', icon: Calendar, activeClasses: 'bg-blue-50 text-blue-600 border-blue-400' },
  { value: 'business', label: 'Business', icon: Briefcase, activeClasses: 'bg-accent-light text-amber-700 border-amber-400' },
  { value: 'community', label: 'Community', icon: Users, activeClasses: 'bg-primary-light text-primary-dark border-primary' },
];

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getDiscoverPost, updateDiscoverPost } = useData();
  const { user } = useAuth();

  const post = getDiscoverPost(id);

  const [postType, setPostType] = useState<PostType>(post?.post_type ?? 'community');
  const [title, setTitle] = useState(post?.title ?? '');
  const [description, setDescription] = useState(post?.description ?? '');
  const [region, setRegion] = useState(post?.regions.slug ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!post) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted text-sm">Post not found.</p>
      </div>
    );
  }

  if (!user || post.user_id !== user.id) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted text-sm">You can only edit your own posts.</p>
      </div>
    );
  }

  const isFormValid = postType && title.trim() && description.trim() && region;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitting(true);
    setSubmitError('');

    const { error } = await updateDiscoverPost(id, {
      post_type: postType,
      title: title.trim(),
      description: description.trim(),
      region_slug: region,
      region_name: REGIONS.find(r => r.slug === region)?.name || region,
    });

    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    router.push(`/discover/${id}`);
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Edit Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Post type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Post Type</label>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = postType === type.value;
              return (
                <button key={type.value} type="button" onClick={() => setPostType(type.value)}
                  className={cn('flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                    isActive ? type.activeClasses : 'bg-white border-border text-muted hover:border-primary/30')}>
                  <Icon size={18} className="flex-shrink-0" />
                  <span className={cn('text-sm font-semibold', isActive ? '' : 'text-foreground')}>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="w-full appearance-none bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">Select a region</option>
            {REGIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={2000}
            className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {submitError && (
          <div className="px-4 py-3 bg-danger-light border border-danger/20 rounded-xl">
            <p className="text-sm text-danger">{submitError}</p>
          </div>
        )}

        <button type="submit" disabled={!isFormValid || submitting}
          className={cn('w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
            isFormValid && !submitting ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-border text-muted cursor-not-allowed')}>
          {submitting ? <><Loader2 size={18} className="animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
