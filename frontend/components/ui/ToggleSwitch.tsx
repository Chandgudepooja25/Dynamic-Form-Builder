'use client';

import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  hint,
  size = 'md',
  disabled,
  className,
  id,
}: ToggleSwitchProps) {
  const dims =
    size === 'sm'
      ? { track: 'h-5 w-9', thumb: 'h-4 w-4', travel: 'translate-x-4' }
      : { track: 'h-6 w-11', thumb: 'h-5 w-5', travel: 'translate-x-5' };

  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ease-out',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
        dims.track,
        checked
          ? 'border-brand-600 bg-brand-600'
          : 'border-slate-300 bg-slate-200',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-out',
          dims.thumb,
          checked ? dims.travel : 'translate-x-0.5'
        )}
      />
    </button>
  );

  if (!label && !hint) {
    return <span className={className}>{control}</span>;
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      {control}
      <span className="flex flex-col">
        {label && (
          <span className="text-sm font-medium text-slate-900">{label}</span>
        )}
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}
