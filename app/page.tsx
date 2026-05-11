import Link from 'next/link';
import { MessageCircle, Search, Star, Image } from 'lucide-react';
import { TrackPageView } from '@/components/TrackPageView';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-12">
      <TrackPageView event="landing_view" />

      {/* Logo */}
      <div className="pt-12 text-center">
        <h1 className="text-5xl font-[500] text-brand">Biso</h1>
        <p className="mt-3 text-lg font-[300] text-[#555555]">
          Une communauté de professionnels de confiance, recommandés pour leur sérieux et la qualité de leurs réalisations.
        </p>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3">
        <Link
          href="/search"
          className="w-full rounded-xl bg-brand py-4 text-center font-[400] text-white"
        >
          Je cherche un pro
        </Link>

        <Link
          href="/artisan"
          className="w-full rounded-xl border-2 border-brand bg-white py-4 text-center font-[400] text-brand"
        >
          Je suis artisan / entreprise
        </Link>
      </div>

      {/* Features list */}
      <div className="flex flex-col gap-4">
        {[
          {
            icon: Search,
            title: 'Recherche simple',
            description: 'Filtrez par service et zone de travail.',
          },
          {
            icon: Star,
            title: 'Avis clients',
            description: 'Consultez les notes et retours des clients.',
          },
          {
            icon: Image,
            title: 'Réalisations',
            description: 'Voyez les photos des travaux déjà réalisés.',
          },
          {
            icon: MessageCircle,
            title: 'Contact WhatsApp',
            description: "Contactez directement l'artisan ou l'entreprise.",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light">
              <Icon size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-[500] text-ink">{title}</p>
              <p className="text-sm font-[300] text-[#666666]">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Manifesto */}
      <p className="pb-12 text-center text-sm font-[300] text-muted">
        Biso signifie <em>« nous »</em> — parce que la confiance se construit ensemble.
      </p>

    </main>
  );
}
