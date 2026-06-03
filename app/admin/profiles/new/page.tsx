import { Suspense } from 'react';
import NewProfileContent from './_content';

export default async function NewProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const expectedKey = process.env.ADMIN_UPLOAD_KEY;

  if (!expectedKey || key !== expectedKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <h1 className="text-xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="mt-2 text-gray-600">
            Cette page est réservée à l'administrateur.
          </p>
        </div>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
          <p className="text-gray-700">Chargement...</p>
        </main>
      }
    >
      <NewProfileContent adminKey={key as string} />
    </Suspense>
  );
}
