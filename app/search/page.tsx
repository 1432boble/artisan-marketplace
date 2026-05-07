'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StarRating from '@/components/StarRating';
import { cleanWhatsappNumber } from '@/lib/whatsapp';

const SERVICE_OPTIONS = [
  'Peinture',
  'Ferraillage',
  'Nettoyage',
  'Froid & Climatisation',
  'Électricité',
  'Menuiserie bois',
  'Carrelage',
  'Plomberie',
  'Plâtrerie (Plaquiste)',
  'Menuiserie aluminium',
  'Étanchéité',
  'Couture / Tailleur',
  'Panneaux solaires',
  'Maçonnerie',
  'Mécanique',
];

const ZONE_OPTIONS = [
  'Tout Abidjan',
  'Toute la Côte d’Ivoire',

  'Abengourou',
  'Abidjan-Abobo',
  'Abidjan-Adjamé',
  'Abidjan-Anyama',
  'Abidjan-Attecoubé',
  'Abidjan-Bingerville',
  'Abidjan-Cocody',
  'Abidjan-Koumassi',
  'Abidjan-Marcory',
  'Abidjan-Plateau',
  'Abidjan-Port-Bouët',
  'Abidjan-Treichville',
  'Abidjan-Yopougon',
  'Aboisso',
  'Agboville',
  'Bondoukou',
  'Bouaflé',
  'Bouaké',
  'Daoukro',
  'Daloa',
  'Divo',
  'Ferkessédougou',
  'Gagnoa',
  'Grand-Bassam',
  'Issia',
  'Korhogo',
  'Man',
  'Odienné',
  'San-Pédro',
  'Séguéla',
  'Soubré',
  'Tiassalé',
  'Yamoussoukro',
];


export default function Home() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [serviceFilter, setServiceFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_services (
            services ( name_fr )
          ),
          reviews (
            rating,
            status
          )
        `)
        .eq('status', 'approved');

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setArtisans(data || []);
    };

    fetchData();
  }, []);

useEffect(() => {
  if (!serviceFilter && !zoneFilter) {
    setFiltered(artisans);
    return;
  }

  let result = artisans;

  if (serviceFilter && serviceFilter !== 'ALL_SERVICES') {
    result = result.filter((a) =>
      a.profile_services
        ?.map((ps: any) => ps.services?.name_fr)
        .join(' ')
        .toLowerCase()
        .includes(serviceFilter.toLowerCase())
    );
  }

  if (zoneFilter && zoneFilter !== 'ALL_ZONES') {
    result = result.filter((a) =>
      a.main_location?.toLowerCase().includes(zoneFilter.toLowerCase())
    );
  }

  setFiltered(result);
}, [serviceFilter, zoneFilter, artisans]);

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900">
        <Link
          href="/"
          className="mb-4 inline-block font-semibold text-gray-700"
        >
         ← Retour à l’accueil
        </Link>
      <h1 className="text-2xl text-center font-bold text-gray-900">Quel pro cherchez-vous ?</h1>

      <p className="mt-1 text-center text-gray-700">
        Choisissez un service, une zone/ville, ou les deux pour lancer la recherche.
      </p>

      {errorMessage && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">
          Error: {errorMessage}
        </p>
      )}

      <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow">
        <select
          className="rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="">Choisir un service</option>
          <option value="ALL_SERVICES">Tous les services</option>
          {SERVICE_OPTIONS.map((service) => (
  <option key={service} value={service}>
    {service}
  </option>
))}
        </select>

        <select
          className="rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
        >
         <option value="">Choisir une zone / ville</option>
         <option value="ALL_ZONES">Toutes les zones / villes</option>
         {ZONE_OPTIONS.map((zone) => (
  <option key={zone} value={zone}>
    {zone}
  </option>
))}
        </select>
      </div>

      <p className="mt-4 text-gray-700">{filtered.length} résultat(s)</p>

{(serviceFilter || zoneFilter) && filtered.length === 0 && (
  <div className="mt-4 rounded-xl bg-white p-5 shadow">
    <h2 className="text-lg font-bold text-gray-900">
      Aucun professionnel trouvé pour le moment
    </h2>

    <p className="mt-2 text-gray-700">
      Nous n’avons pas encore de professionnel disponible
      {serviceFilter ? ` pour ${serviceFilter}` : ''}
      {zoneFilter ? ` dans la zone : ${zoneFilter}` : ''}.
    </p>

    <p className="mt-3 text-sm text-gray-600">
      Biso continue d’ajouter de nouveaux professionnels de confiance.
      Revenez bientôt ou recommandez-nous un artisan ou une entreprise dans cette zone.
    </p>
  </div>
)}

      <div className="mt-4 grid gap-4">
        {filtered.map((a) => {
          const services =
            a.profile_services
              ?.map((ps: any) => ps.services?.name_fr)
              .filter(Boolean) || [];

          const approvedReviews =
            a.reviews?.filter((r: any) => r.status === 'approved') || [];

          const averageRating =
            approvedReviews.length > 0
              ? (
                  approvedReviews.reduce(
                    (sum: number, review: any) => sum + review.rating,
                    0
                  ) / approvedReviews.length
                ).toFixed(1)
              : null;

          const whatsappNumber = cleanWhatsappNumber(a.whatsapp);

          return (
            <div key={a.id} className="rounded-xl bg-white p-5 shadow">
              <div>
  <div className="flex items-start justify-between gap-3">
    <h2 className="text-xl font-bold text-gray-900">
      {a.profile_type === 'company' ? a.company_name : a.contact_name}
    </h2>

    <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
      {a.profile_type === 'company' ? 'Entreprise' : 'Artisan'}
    </span>
  </div>

  <p className="mt-1 text-sm font-semibold text-gray-700">
    {a.profile_type === 'company'
      ? `Contact: ${a.contact_name}`
      : a.company_name || 'Artisan indépendant'}
  </p>

  <p className="mt-2 text-sm font-semibold text-blue-700">
    {services.length > 0 ? services.join(', ') : 'Service non renseigné'}
  </p>

  {a.is_verified && (
    <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
      Vérifié
    </span>
  )}
</div>

              <div className="mt-2 space-y-1 text-sm text-gray-700">
  <p>
    📍 Zone couverte : {a.main_location || 'Zone non renseignée'}
  </p>
  <p>
    Expérience : {a.experience_years || 'Expérience non renseignée'}
  </p>
</div>

              
              <StarRating
                rating={averageRating ? Number(averageRating) : null}
                count={approvedReviews.length}
              />

              <p className="mt-3 text-gray-800">
                {a.description || 'Description non renseignée'}
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  href={`/profiles/${a.id}`}
                  className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white"
                >
                  Voir profil
                </Link>

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=Bonjour, je vous ai trouvé via la plateforme et je souhaite discuter de vos services.`}
                    target="_blank"
                    className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}