import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  CheckCircle,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  User,
  Users,
  Wrench,
  XCircle,
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
      "Les clients vous contactent directement sur WhatsApp. Pas d'intermédiaire, pas de frais.",
  },
  {
    icon: Star,
    title: 'Construisez votre réputation',
    description:
      'Les avis clients vérifiés renforcent votre crédibilité et vous démarquent.',
  },
  {
    icon: ShieldCheck,
    title: 'Profil vérifié et gratuit',
    description:
      "L'inscription est entièrement gratuite. Notre équipe vérifie chaque profil avant publication.",
  },
];

const INFO_ROWS = [
  { icon: User, text: "Nom du contact : ex. N'guessan Koffi" },
  { icon: Building, text: 'Nom entreprise (si applicable)' },
  { icon: Wrench, text: 'Service principal : ex. Électricité' },
  { icon: MapPin, text: 'Zone / ville : ex. Tout Abidjan' },
  { icon: Phone, text: 'Numéro WhatsApp' },
];

const PHOTO_CHECKLIST = [
  { icon: CheckCircle, color: 'text-green-700', text: 'Travaux terminés, nettes et bien éclairées' },
  { icon: CheckCircle, color: 'text-green-700', text: 'Avant / après si disponible' },
  { icon: XCircle, color: 'text-brand', text: 'Pas de photos floues ou sombres' },
  { icon: XCircle, color: 'text-brand', text: "Pas de captures d'écran" },
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
                expérience et numéro WhatsApp.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="flex items-start gap-3">
            <span className="w-6 shrink-0 text-lg font-[500] text-brand">02</span>
            <div className="flex-1">
              <p className="font-[500] text-ink">Envoyez 6 photos via WhatsApp</p>
              <p className="mt-1 text-sm font-[300] text-[#666666]">
                Envoyez jusqu'à 6 photos claires de vos meilleures réalisations,
                avec les informations suivantes :
              </p>

              <div className="mt-3 rounded-xl border border-border bg-bg p-3">
                {INFO_ROWS.map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 py-1.5 text-sm font-[300] text-[#666666]"
                  >
                    <Icon size={14} className="shrink-0 text-brand" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                {PHOTO_CHECKLIST.map(({ icon: Icon, color, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-sm font-[300] text-[#666666]"
                  >
                    <Icon size={15} className={`shrink-0 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="flex items-start gap-3">
            <span className="w-6 shrink-0 text-lg font-[500] text-brand">03</span>
            <div>
              <p className="font-[500] text-ink">Votre profil est publié</p>
              <p className="mt-1 text-sm font-[300] text-[#666666]">
                Notre équipe vérifie et publie votre profil. Les clients peuvent
                vous contacter directement sur WhatsApp.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="mt-2 bg-white px-4 py-6">
        <p className="mb-4 text-center text-sm font-[300] text-[#666666]">
          L'inscription est gratuite. Rejoignez déjà plus de 100 professionnels
          sur Biso.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="https://forms.gle/aVgXmnXDY54ny4ca9"
            target="_blank"
            className="block w-full rounded-xl bg-brand py-4 text-center font-[400] text-white"
          >
            Remplir le formulaire d'inscription
          </a>

          <a
            href="https://wa.me/2250758539476"
            target="_blank"
            className="block w-full rounded-xl border-[1.5px] border-brand bg-white py-3 text-center font-[400] text-brand"
          >
            <span className="block">Envoyer mes photos via WhatsApp</span>
            <span className="block text-sm font-[300] text-[#888888]">
              07 58 53 94 76
            </span>
          </a>
        </div>
      </div>

    </main>
  );
}
