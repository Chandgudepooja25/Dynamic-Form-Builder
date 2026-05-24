'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { roleHome } from '@/lib/utils';

export function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'admin' | 'user';
}) {
  const router = useRouter();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    // Role mismatch → send the user to their own role's home instead of '/',
    // so a "User" who lands on /admin gets bounced to /user (and vice versa).
    if (role && user.role !== role) router.replace(roleHome(user.role));
  }, [hydrated, user, role, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      </div>
    );
  }

  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
}
