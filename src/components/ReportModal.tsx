'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'scam_fraud', label: 'Scam / Fraud' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'wrong_category', label: 'Wrong category' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'misleading', label: 'Misleading information' },
] as const;

type TargetType = 'discover_post' | 'market_listing' | 'property_listing';

export default function ReportModal({
  targetType,
  targetId,
  onClose,
}: {
  targetType: TargetType;
  targetId: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError('');

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('submit_report', {
      p_target_type: targetType,
      p_target_id: targetId,
      p_reason: selected,
      p_notes: notes.trim() || null,
    });

    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setSuccess(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Report</h3>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle size={40} className="text-primary mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Report submitted</p>
            <p className="text-xs text-muted">We&apos;ll review this and take action if needed.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-3">Why are you reporting this?</p>
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelected(reason.value)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm border rounded-xl transition-all',
                    selected === reason.value
                      ? 'border-primary bg-primary-light text-primary font-medium'
                      : 'border-border text-foreground hover:bg-surface hover:border-primary/30',
                  )}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {/* Optional notes */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details (optional)"
              rows={2}
              maxLength={500}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-foreground resize-none placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4"
            />

            {error && (
              <p className="text-sm text-danger mb-3 bg-danger-light p-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-surface text-foreground text-sm font-medium rounded-xl border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                  selected && !submitting
                    ? 'bg-danger text-white'
                    : 'bg-border text-muted cursor-not-allowed',
                )}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
