import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md';

const SIZE_CLASS: Record<Size, string> = {
  xs: 'text-[9px] px-1.5 py-0.5 gap-0.5',
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1',
};

const ICON_SIZE: Record<Size, number> = { xs: 9, sm: 11, md: 13 };

export default function VerifiedPartner({
  partnerName,
  size = 'sm',
  className,
}: {
  partnerName?: string | null;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wide',
        SIZE_CLASS[size],
        className,
      )}
      style={{ backgroundColor: '#EFF6FF', color: '#114B8A' }}
    >
      <ShieldCheck size={ICON_SIZE[size]} strokeWidth={2.5} />
      {partnerName ? `Verified · ${partnerName}` : 'Verified Partner'}
    </span>
  );
}
