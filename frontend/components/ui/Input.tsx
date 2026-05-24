'use client';

import {
  forwardRef,
  useEffect,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const baseField =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-card ' +
  'placeholder:text-slate-400 transition-[box-shadow,border-color] duration-150 ' +
  'hover:border-slate-300 ' +
  'focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 ' +
  'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(baseField, className)} {...rest} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseField, 'min-h-[120px] resize-y', className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        baseField,
        'appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2714%27 height=%2714%27 viewBox=%270 0 20 20%27 fill=%27none%27><path d=%27M6 8l4 4 4-4%27 stroke=%27%2364748b%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/></svg>")] bg-size-[14px_14px] bg-position-[right_14px_center] bg-no-repeat pr-10',
        className
      )}
      {...rest}
    />
  );
});

export function Label({
  className,
  children,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'mb-1.5 block text-[13px] font-medium text-slate-700',
        className
      )}
      {...rest}
    >
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-red-600">{children}</p>;
}

export function Hint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-slate-500">{children}</p>;
}

/* -------------------------------------------------------------------------- */
/*  PasswordInput — same look as <Input>, with an eye toggle on the right.     */
/* -------------------------------------------------------------------------- */

type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  /** Accessible label for the toggle button (defaults are sensible). */
  showLabel?: string;
  hideLabel?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      showLabel = 'Show password',
      hideLabel = 'Hide password',
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref
  ) {
    // Visibility is always OFF by default (and never persisted).
    const [visible, setVisible] = useState(false);

    // Track whether the field currently has a value so we can conditionally
    // render the eye toggle. Works for both controlled and uncontrolled use:
    //  - controlled: derive from `value`
    //  - uncontrolled: track internally via onChange
    const [internalLen, setInternalLen] = useState<number>(() => {
      if (typeof value === 'string') return value.length;
      if (typeof defaultValue === 'string') return defaultValue.length;
      return 0;
    });
    const len = typeof value === 'string' ? value.length : internalLen;
    const hasValue = len > 0;

    // Safety: if the user clears the field while the password was visible,
    // reset to hidden so the next time they type it isn't unexpectedly shown.
    useEffect(() => {
      if (!hasValue && visible) setVisible(false);
    }, [hasValue, visible]);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      setInternalLen(e.target.value.length);
      onChange?.(e);
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          /* pr-11 is reserved even when the button is hidden so the icon's
             appearance never causes layout shift. */
          className={cn(baseField, 'pr-11', className)}
          {...rest}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? hideLabel : showLabel}
            aria-pressed={visible}
            title={visible ? hideLabel : showLabel}
            tabIndex={0}
            /* key forces a re-mount when visibility changes so the inner icon
               fades in crisply each toggle. The outer button itself also
               fades in when the input first receives a value. */
            className={cn(
              'absolute inset-y-0 right-0 my-1 mr-1 flex w-9 items-center justify-center rounded-lg',
              'text-slate-400 transition-all duration-150 ease-out',
              'animate-fade-in',
              'hover:bg-slate-100 hover:text-slate-700',
              'focus:outline-none focus-visible:bg-slate-100 focus-visible:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-200'
            )}
          >
            <span
              key={visible ? 'on' : 'off'}
              className="inline-flex animate-fade-in"
            >
              {visible ? <EyeIcon /> : <EyeOffIcon />}
            </span>
          </button>
        )}
      </div>
    );
  }
);

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.75 10S4.75 4.25 10 4.25 18.25 10 18.25 10 15.25 15.75 10 15.75 1.75 10 1.75 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10"
        cy="10"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 3.5l13 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.2 5.2A8.4 8.4 0 0 1 10 5c5.25 0 8.25 5 8.25 5a13.5 13.5 0 0 1-2.4 2.95M12.9 12.9A8.4 8.4 0 0 1 10 15c-5.25 0-8.25-5-8.25-5 0 0 1.1-2.03 3.2-3.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 8.4a2.25 2.25 0 0 0 3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
