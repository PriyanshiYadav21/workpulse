import { cn } from '../../utils/cn';

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const SIZE_MAP = {
  6:  'h-6 w-6 text-[10px]',
  7:  'h-7 w-7 text-[11px]',
  8:  'h-8 w-8 text-xs',
  10: 'h-10 w-10 text-sm',
  12: 'h-12 w-12 text-base',
  16: 'h-16 w-16 text-lg',
  20: 'h-20 w-20 text-2xl',
};

export default function Avatar({ name, src, size = 8, className }) {
  const dim = SIZE_MAP[size] || SIZE_MAP[8];
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={cn(dim, 'rounded-full object-cover ring-2 ring-white/50 dark:ring-white/10', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        dim,
        'rounded-full grid place-items-center font-semibold text-white',
        'bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400',
        'ring-2 ring-white/40 dark:ring-white/10',
        className
      )}
    >
      {initials(name) || '?'}
    </div>
  );
}
