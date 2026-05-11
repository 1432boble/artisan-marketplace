import Link from 'next/link';
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Users,
    title: 'Plus de visibilité',
    description:
      "Votre profil est visible par tous les clients qui cherchent votre métier en Côte d'Ivoire.",
  },
  {
    icon: MessageCircle,
    title: 'Contact direct, sans commission',
    description:
      "Les clients vous contactent sur WhatsApp. Pas d'intermédiaire, pas de frais.",
  },
  {
    icon: Star,
    title: 'Construisez votre réputation',
    description:
      'Les avis clients renforcent votre crédibilité et vous démarquent de la concurrence.',
  },
  {
    icon: ShieldCheck,
    title: 'Gratuit et vérifié',
    description:
      "L'inscription est entièrement gratuite. Chaque profil est vérifié par notre équipe avant publication.",
  },
];

export default function ArtisanPage() {
  return (
    <main className="min-h-screen bg-bg pb-10">

      {/* Back link */}
      <div className="bg-white px-4 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-[400] text-[#888888]"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </Link>
      </div>

      {/* Hero banner */}
      <div className="bg-brand px-6 py-8 text-center">
        <h1 className="text-xl font-[500] text-white">
          Rejoignez Biso, développez votre activité.
        </h1>
        <p className="mt-2 font-[300] text-white/80">
          Soyez contacté directement par des clients sérieux, partout en Côte
          d'Ivoire. Gratuit, simple, sans intermédiaire.
        </p>
      </div>

      {/* Benefits */}
      <div className="mt-2 bg-white px-4 py-5">
        <h2 className="mb-4 font-[500] text-ink">Pourquoi rejoindre Biso ?</h2>
        <div className="flex flex-col gap-4">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light">
                <Icon size={16} className="text-brand" />
              </div>
              <div>
                <p className="font-[500] text-ink">{title}</p>
                <p className="mt-0.5 text-sm font-[300] text-[#666666]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to register */}
      <div className="mt-2 bg-white px-4 py-5">
        <h2 className="mb-5 font-[500] text-ink">Comment s'inscrire ?</h2>

        <div className="flex flex-col gap-6">

          {/* Step 01 */}
          <div className="flex items-start gap-3">
            <span className="w-6 shrink-0 text-lg font-[500] text-brand">01</span>
            <div>
              <p className="font-[500] text-ink">Remplissez le formulaire</p>
              <p className="mt-1 text-sm font-[300] text-[#666666]">
                Renseignez vos informations : nom, métier, zone d'intervention,
                expérience et numéro WhatsApp. Cela prend moins de 2 minutes.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="flex items-start gap-3">
            <span className="w-6 shrink-0 text-lg font-[500] text-brand">02</span>
            <div>
              <p className="font-[500] text-ink">Notre équipe vous contacte</p>
              <p className="mt-1 text-sm font-[300] text-[#666666]">
                Nous vérifions votre profil et vous recontactons sur WhatsApp pour
                finaliser votre inscription. Votre profil est ensuite publié et
                visible par tous les clients.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="mt-2 bg-white px-4 py-6">
        <a
          href="https://forms.gle/aVgXmnXDY54ny4ca9"
          target="_blank"
          className="block w-full rounded-xl bg-brand py-4 text-center font-[400] text-white"
        >
          Remplir le formulaire d'inscription
        </a>
      </div>

    </main>
  );
}
