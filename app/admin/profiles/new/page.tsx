import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin-auth';
import NewProfileContent from './_content';

export default async function NewProfilePage() {
  if (!(await isAuthed())) {
    redirect('/admin/login?next=/admin/profiles/new');
  }

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <p className="text-gray-700">Chargement...</p>
        </main>
      }
    >
      <NewProfileContent />
    </Suspense>
  );
}
