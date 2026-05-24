'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hydrates the Zustand auth store from localStorage on mount.
 * Lives at the root so every page sees the same (possibly logged-in) state.
 */
export function AuthHydrator() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
