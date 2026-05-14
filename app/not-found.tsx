import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 flex flex-col items-center justify-center">
      <div className="rounded-xl bg-white p-8 shadow text-center max-w-sm w-full">
        <p className="text-5xl font-bold text-gray-200">404</p>
        <h1 className="mt-3 text-xl font-bold text-gray-900">
          Page introuvable
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Cette page n'existe pas ou le lien est incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
