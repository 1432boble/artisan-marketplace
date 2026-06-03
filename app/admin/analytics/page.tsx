import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin-auth';
import AnalyticsContent from './_content';

export default async function AdminAnalyticsPage() {
  if (!(await isAuthed())) {
    redirect('/admin/login?next=/admin/analytics');
  }

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
          <p style={{ color: 'var(--muted)' }}>Chargement...</p>
        </main>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
