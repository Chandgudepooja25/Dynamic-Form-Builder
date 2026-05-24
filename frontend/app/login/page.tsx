'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FieldError, Input, Label, PasswordInput } from '@/components/ui/Input';
import { roleHome } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      router.replace(roleHome(user.role));
    } catch {
      /* handled via store */
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col overflow-x-hidden overflow-y-hidden px-4 pb-4 sm:px-6">
      <div className="shrink-0 pt-4 sm:pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Sign in</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-slate-600">
          New here?{' '}
          <Link
            href="/register"
            className="font-medium text-brand-700 transition hover:text-brand-800 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      <Card className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden p-0 shadow-card-md sm:mt-5">
        <form
          onSubmit={onSubmit}
          className="scrollbar-thin flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto overscroll-y-contain p-5 sm:p-6"
        >
          <div
            className="mb-1 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3"
            aria-hidden
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-500/15 to-indigo-500/10 text-brand-600 ring-1 ring-brand-200/40">
              <KeyRound className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="text-sm text-slate-600">
              Use the email and password for your account.
            </p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <FieldError>{error}</FieldError>
          <div className="pt-0.5">
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Log in
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
