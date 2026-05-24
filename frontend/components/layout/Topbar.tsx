'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type NavLink = {
  href: string;
  label: string;
};

/**
 * Build the nav links based on auth state + role.
 *  - Guests: just "Home".
 *  - Admins: "Home" + "Admin" (→ /admin).
 *  - Users:  "Home" + "User"  (→ /user) — symmetrical to the admin case, so
 *    the "User" tab highlights whenever the user is on their landing page,
 *    just like "Admin" does for admins.
 *  - If a logged-in user somehow has no `role`, we fall back to user/"/user".
 */
function buildNavLinks(user: { role?: string } | null): NavLink[] {
  const links: NavLink[] = [{ href: '/', label: 'Home' }];
  if (!user) return links;

  if (user.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin' });
  } else {
    links.push({ href: '/user', label: 'User' });
  }
  return links;
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hydrated } = useAuthStore();
  const navLinks = buildNavLinks(user);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 shadow-[0_1px_0_0_rgba(15,23,42,0.04),0_8px_32px_-12px_rgba(99,102,241,0.08)] backdrop-blur-xl supports-backdrop-filter:bg-white/70">
      <div className="mx-auto flex h-(--header-height) max-w-7xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-5 sm:gap-8">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 font-semibold text-slate-900"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-indigo-700 text-white shadow-[0_2px_8px_-1px_rgba(79,70,229,0.4)] transition-transform duration-200 group-hover:scale-[1.04]"
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 5h12M4 10h8M4 15h12"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-[17px] tracking-tight sm:text-lg">FormCraft</span>
          </Link>
          <nav
            className="hidden min-w-0 items-center gap-0.5 sm:flex"
            aria-label="Primary"
          >
            {navLinks.map((l) => {
              const active =
                l.href === '/'
                  ? pathname === '/'
                  : pathname === l.href || pathname.startsWith(l.href + '/');
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-slate-900/5 text-slate-900 ring-1 ring-slate-200/80'
                      : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {!hydrated ? null : user ? (
            <>
              <div className="hidden items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/60 py-0.5 pr-2.5 pl-0.5 shadow-sm ring-1 ring-slate-200/30 backdrop-blur sm:flex">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-indigo-700 text-xs font-bold text-white shadow-sm"
                  aria-hidden
                >
                  {user.email.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[min(10rem,28vw)] truncate text-sm text-slate-800">
                  {user.email}
                </span>
                <Badge tone={user.role === 'admin' ? 'brand' : 'gray'}>
                  {user.role ?? 'user'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="shrink-0"
              >
                Log out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-50/80 p-0.5 pl-0.5 shadow-sm ring-1 ring-slate-200/20">
              <Link href="/login" className="shrink-0">
                <Button variant="secondary" size="sm" className="rounded-full border-0 bg-white shadow-none">
                  Log in
                </Button>
              </Link>
              <Link href="/register" className="shrink-0">
                <Button size="sm" className="rounded-full px-4">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
