import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-10">
        <div className="rounded-2xl bg-white p-6 shadow">
          
<h1 className="text-4xl text-center font-bold leading-tight text-gray-900">
  Biso
</h1>

<p className="mt-4 text-center text-lg text-gray-700">
  Une communauté de professionnels de confiance, recommandés pour leur sérieux, leur savoir-faire et la qualité de leurs réalisations.
</p>

<p className="mt-2 text-center text-sm text-gray-500">
  Biso signifie «nous» — parce que la confiance se construit ensemble.
</p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/search"
              className="block rounded-xl bg-gray-900 px-5 py-4 text-center text-lg font-bold text-white"
            >
              Je cherche un pro
            </Link>

            <a
              href="https://forms.gle/Km1Cq9u8BAJPYHys7"
              target="_blank"
              className="block rounded-xl border border-gray-300 bg-white px-5 py-4 text-center text-lg font-bold text-gray-900"
            >
              Je suis artisan / entreprise
            </a>
          </div>

          <div className="mt-6 grid gap-3 border-t pt-5 text-sm text-gray-700">
            <div>
              <p className="font-bold text-gray-900">🔎 Recherche simple</p>
              <p>Filtrez par service et zone de travail.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900">⭐ Avis clients</p>
              <p>Consultez les notes et retours des clients.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900">📸 Réalisations</p>
              <p>Voyez les photos des travaux déjà réalisés.</p>
            </div>

            <div>
              <p className="font-bold text-gray-900">📲 Contact WhatsApp</p>
              <p>Contactez directement l’artisan ou l’entreprise.</p>
            </div>
          </div>

        </div>

        <p className="mb-3 text-center inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            Plateforme de confiance
    
</p>
      </section>
    </main>
  );
}