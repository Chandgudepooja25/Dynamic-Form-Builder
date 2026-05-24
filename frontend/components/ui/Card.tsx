'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
        className
      )}
      {...rest}
    />
  );
}

export function Badge({
  children,
  tone = 'brand',
  className,
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'gray' | 'green' | 'amber' | 'red';
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-100',
    gray: 'bg-slate-100 text-slate-600 ring-slate-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-100',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
