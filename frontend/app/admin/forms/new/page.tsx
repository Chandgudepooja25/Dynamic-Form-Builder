'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { FormBuilder } from '@/components/builder/FormBuilder';

export default function NewFormPage() {
  // Only administrators can build forms. The server also enforces this; the
  // client guard just short-circuits to /user before any API call is made.
  return (
    <RequireAuth role="admin">
      <FormBuilder />
    </RequireAuth>
  );
}
