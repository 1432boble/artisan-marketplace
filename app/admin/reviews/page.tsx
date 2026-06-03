import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin-auth';
import AdminReviewsContent from './_content';

export default async function AdminReviewsPage() {
  if (!(await isAuthed())) {
    redirect('/admin/login?next=/admin/reviews');
  }

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <p className="text-gray-700">Chargement...</p>
        </main>
      }
    >
      <AdminReviewsContent />
    </Suspense>
  );
}
