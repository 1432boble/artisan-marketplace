import { Suspense } from 'react';
import AnalyticsContent from './_content';

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const expectedKey = process.env.ADMIN_UPLOAD_KEY;

  if (!expectedKey || key !== expectedKey) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>Accès non autorisé</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Cette page est réservée à l'administrateur.
          </p>
        </div>
      </main>
    );
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
