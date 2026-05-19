import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 shadow-lg transition-all active:scale-[0.98]',
};

export default function Button({ as: Tag = 'button', variant = 'primary', className, children, ...rest }) {
  return (
    <Tag className={cn(VARIANTS[variant] || VARIANTS.primary, className)} {...rest}>
      {children}
    </Tag>
  );
}
