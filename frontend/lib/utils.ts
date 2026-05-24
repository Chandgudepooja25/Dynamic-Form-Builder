import clsx, { type ClassValue } from 'clsx';

export const cn = (...v: ClassValue[]) => clsx(...v);

export function newId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDate(d?: string | Date | null) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString();
}

/**
 * Canonical post-login landing page for a given role.
 * Centralised so the login screen, register screen, route guard and nav bar
 * all agree where each role "lives" — admins on /admin, everyone else on /user.
 */
export function roleHome(role?: string | null): '/admin' | '/user' {
  return role === 'admin' ? '/admin' : '/user';
}
