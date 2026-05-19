import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  { label, className, error, icon: Icon, ...rest },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        )}
        <input
          ref={ref}
          className={cn('input', Icon && 'pl-10', error && 'border-brand-400 focus:ring-brand-400/30', className)}
          {...rest}
        />
      </div>
      {error && <span className="block text-xs text-brand-700 mt-1">{error}</span>}
    </label>
  );
});

export default Input;
