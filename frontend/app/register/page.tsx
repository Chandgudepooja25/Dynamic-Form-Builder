'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  FieldError,
  Hint,
  Input,
  Label,
  PasswordInput,
  Select,
} from '@/components/ui/Input';
import { roleHome } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
  }>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await register(form);
      router.replace(roleHome(user.role));
    } catch {
      /* handled via store */
    }
  }

  return (
    <div
      className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col overflow-y-hidden overflow-x-hidden px-4 pb-4 sm:px-6"
    >
      <div className="shrink-0 pt-4 sm:pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Account</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-1 text-slate-600">
          Already have one?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Log in
          </Link>
          .
        </p>
      </div>

      <Card className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden p-0 shadow-card-md sm:mt-5">
        <form
          onSubmit={onSubmit}
          className="scrollbar-thin flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto overscroll-y-contain p-5 sm:p-6"
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="role">Account type</Label>
            <Select
              id="role"
              value={form.role}
              onChange={(e) =>
                update('role', e.target.value as 'user' | 'admin')
              }
            >
              <option value="user">User — fill and submit forms</option>
              <option value="admin">Admin — build and manage forms</option>
            </Select>
          </div>
          <Hint>
            Admins can create, edit, and publish forms. Users can only view
            and fill out published forms.
          </Hint>
          <FieldError>{error}</FieldError>
          <div className="pt-0.5">
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
