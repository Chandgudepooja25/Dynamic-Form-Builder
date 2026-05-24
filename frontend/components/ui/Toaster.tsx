'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * App-wide toast host. We render a single instance at the root layout so
 * every `toast.*` call anywhere in the tree shows up in the same stack.
 *
 * Styling is tuned to match our design system:
 *  - rounded-xl cards
 *  - brand-indigo ring on focus (inherited from globals.css)
 *  - tonal borders per severity via `classNames`
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl border border-slate-200 bg-white shadow-card-md text-sm text-slate-800',
          title: 'font-semibold text-slate-900',
          description: 'text-slate-600',
          actionButton: 'rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold',
          cancelButton: 'rounded-lg bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-semibold',
        },
      }}
    />
  );
}
