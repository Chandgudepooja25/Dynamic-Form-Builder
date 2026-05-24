'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-linear-to-b from-brand-500 to-brand-600 text-white shadow-[0_1px_2px_0_rgb(79_70_229/0.2),0_4px_12px_-2px_rgb(79_70_229/0.35)] ' +
    'hover:from-brand-500 hover:to-brand-700 hover:shadow-[0_1px_2px_0_rgb(79_70_229/0.25),0_6px_16px_-2px_rgb(79_70_229/0.45)] ' +
    'active:translate-y-px active:shadow-[0_1px_2px_0_rgb(79_70_229/0.2)] ' +
    'disabled:from-brand-300 disabled:to-brand-300 disabled:shadow-none',
  secondary:
    'bg-white text-slate-800 border border-slate-200 shadow-card hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  danger:
    'bg-red-600 text-white shadow-[0_1px_2px_0_rgb(220_38_38/0.2),0_4px_12px_-2px_rgb(220_38_38/0.35)] hover:bg-red-700 active:translate-y-px',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-70',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
