'use client';

import { use } from 'react';
import { RequireAuth } from '@/components/RequireAuth';
import { FormBuilder } from '@/components/builder/FormBuilder';

export default function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // Only administrators can edit forms; the server also rejects writes from
  // non-admins, but the client guard avoids flashing the builder UI.
  return (
    <RequireAuth role="admin">
      <FormBuilder formId={id} />
    </RequireAuth>
  );
}
