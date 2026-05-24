'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

type Tone = 'danger' | 'default';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Accessible confirm modal built on Radix Dialog. Replaces the browser's
 * native `confirm()` which is jarring, unstyled, and impossible to match
 * to the design system.
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog open={open} onOpenChange={setOpen}
 *     title="Delete this form?"
 *     description="This cannot be undone."
 *     onConfirm={async () => { await api.remove(id); }}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    if (busy || loading) return;
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-slate-200 bg-white p-6 shadow-card-md',
            'data-[state=open]:animate-slide-up focus:outline-none'
          )}
        >
          <div className="flex items-start gap-4">
            {tone === 'danger' && (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
                aria-hidden
              >
                <AlertTriangle size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1.5 text-sm text-slate-600">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" size="sm">
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirm}
              loading={busy || loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
