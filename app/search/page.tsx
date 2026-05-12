'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import StarRating from '@/components/StarRating';
import { cleanWhatsappNumber } from '@/lib/whatsapp';
import { ArrowLeft, ChevronDown, MapPin } from 'lucide-react';
import { track } from '@/lib/track';

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

const SERVICE_SELECT_OPTIONS = [
  { label: 'Tous les services', value: 'ALL_SERVICES' },
  ...SERVICE_OPTIONS.map((s) => ({ label: s, value: s })),
];

const ZONE_SELECT_OPTIONS = [
  { label: "Toute la Côte d'Ivoire", value: 'ALL_ZONES' },
  { label: 'Tout Abidjan', value: 'Tout Abidjan' },
  { label: 'Abidjan - Abobo', value: 'Abidjan - Abobo' },
  { label: 'Abidjan - Adjamé', value: 'Abidjan - Adjamé' },
  { label: 'Abidjan - Anyama', value: 'Abidjan - Anyama' },
  { label: 'Abidjan - Attecoubé', value: 'Abidjan - Attecoubé' },
  { label: 'Abidjan - Bingerville', value: 'Abidjan - Bingerville' },
  { label: 'Abidjan - Cocody', value: 'Abidjan - Cocody' },
  { label: 'Abidjan - Koumassi', value: 'Abidjan - Koumassi' },
  { label: 'Abidjan - Marcory', value: 'Abidjan - Marcory' },
  { label: 'Abidjan - Plateau', value: 'Abidjan - Plateau' },
  { label: 'Abidjan - Port-Bouet', value: 'Abidjan - Port-Bouet' },
  { label: 'Abidjan - Treichville', value: 'Abidjan - Treichville' },
  { label: 'Abidjan - Yopougon', value: 'Abidjan - Yopougon' },
  { label: 'Abengourou', value: 'Abengourou' },
  { label: 'Aboisso', value: 'Aboisso' },
  { label: 'Agboville', value: 'Agboville' },
  { label: 'Bondoukou', value: 'Bondoukou' },
  { label: 'Bouaflé', value: 'Bouaflé' },
  { label: 'Bouaké', value: 'Bouaké' },
  { label: 'Daoukro', value: 'Daoukro' },
  { label: 'Daloa', value: 'Daloa' },
  { label: 'Divo', value: 'Divo' },
  { label: 'Ferkessédougou', value: 'Ferkessédougou' },
  { label: 'Gagnoa', value: 'Gagnoa' },
  { label: 'Grand-Bassam', value: 'Grand-Bassam' },
  { label: 'Issia', value: 'Issia' },
  { label: 'Korhogo', value: 'Korhogo' },
  { label: 'Man', value: 'Man' },
  { label: 'Odienné', value: 'Odienné' },
  { label: 'San-Pédro', value: 'San-Pédro' },
  { label: 'Séguéla', value: 'Séguéla' },
  { label: 'Soubré', value: 'Soubré' },
  { label: 'Tiassalé', value: 'Tiassalé' },
  { label: 'Yamoussoukro', value: 'Yamoussoukro' },
];

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border-[1.5px] border-brand bg-white px-4 py-3 font-[400] text-brand"
      >
        <span className={selectedLabel ? '' : 'opacity-60'}>{selectedLabel || placeholder}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-brand-light ${
                value === opt.value ? 'font-[500] text-brand' : 'font-[400] text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type TypeFilter = 'all' | 'artisan' | 'company';

export default function SearchPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [serviceFilter, setServiceFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    track('search_view');
  }, []);

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
    if (!serviceFilter && !zoneFilter && typeFilter === 'all') {
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
      result = result.filter((a) => {
        const zones: string[] = a.work_zones || [];
        if (zoneFilter === 'Tout Abidjan') {
          return zones.some((z) => z.toLowerCase().includes('abidjan'));
        }
        return zones.some((z) => z.toLowerCase() === zoneFilter.toLowerCase());
      });
    }

    if (typeFilter !== 'all') {
      result = result.filter((a) => a.profile_type === typeFilter);
    }

    setFiltered(result);
  }, [serviceFilter, zoneFilter, typeFilter, artisans]);

  const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'artisan', label: 'Artisan' },
    { value: 'company', label: 'Entreprise' },
  ];

  return (
    <main className="min-h-screen bg-bg">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-4 shadow-sm">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-[400] text-[#888888]"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </Link>

        <h1 className="text-center text-2xl font-[500] text-ink">
          Quel pro cherchez-vous ?
        </h1>
        <p className="mt-1 text-center text-sm font-[300] text-[#555555]">
          Choisissez un service, une zone/ville, ou les deux pour lancer la recherche.
        </p>

        <div className="mt-3 grid gap-2">
          <CustomSelect
            value={serviceFilter}
            onChange={setServiceFilter}
            options={SERVICE_SELECT_OPTIONS}
            placeholder="Choisir un service"
          />
          <CustomSelect
            value={zoneFilter}
            onChange={setZoneFilter}
            options={ZONE_SELECT_OPTIONS}
            placeholder="Choisir une zone"
          />
        </div>

        {/* Type filter chips */}
        <div className="mt-3 flex gap-2">
          {TYPE_CHIPS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-[400] transition-colors ${
                typeFilter === value
                  ? 'border-brand bg-brand text-white'
                  : 'border-border bg-white text-[#888888]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="pt-4 min-h-[40vh]">
        <p className="mb-3 px-4 text-sm font-[300] text-[#888888]">
          {filtered.length} résultat(s)
        </p>

        {errorMessage && (
          <p className="mx-4 mb-3 rounded bg-red-100 p-3 text-red-700">{errorMessage}</p>
        )}

        {(serviceFilter || zoneFilter || typeFilter !== 'all') && filtered.length === 0 && (
          <div className="mx-[10px] rounded-2xl border border-border bg-white p-5">
            <h2 className="font-[500] text-ink">
              Aucun professionnel trouvé pour le moment
            </h2>
            <p className="mt-2 text-sm font-[300] text-[#555555]">
              Nous n'avons pas encore de professionnel disponible
              {serviceFilter && serviceFilter !== 'ALL_SERVICES'
                ? ` pour ${serviceFilter}`
                : ''}
              {zoneFilter && zoneFilter !== 'ALL_ZONES'
                ? ` dans la zone : ${zoneFilter}`
                : ''}
              .
            </p>
            <p className="mt-3 text-sm font-[300] text-[#888888]">
              Biso continue d'ajouter de nouveaux professionnels de confiance.
              Revenez bientôt ou recommandez-nous un artisan ou une entreprise dans cette zone.
            </p>
          </div>
        )}

        <div className="flex flex-col">
          {(filtered || []).map((a) => {
            try {
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
              <div
                key={a.id}
                className="mx-[10px] mb-[10px] rounded-2xl border border-border bg-white p-[14px]"
              >
                {/* Top row: name + badge + rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-[500] text-ink">
                      {a.profile_type === 'company' ? a.company_name : a.contact_name}
                    </h2>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-[400] text-[#888888]">
                      {a.profile_type === 'company' ? 'Entreprise' : 'Artisan'}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <StarRating
                      rating={averageRating ? Number(averageRating) : null}
                      count={approvedReviews.length}
                    />
                  </div>
                </div>

                {/* Service */}
                <p
                  className={`mt-1 text-sm font-[500] ${
                    a.profile_type === 'company' ? 'text-accent' : 'text-brand'
                  }`}
                >
                  {services.length > 0 ? services.join(', ') : 'Service non renseigné'}
                </p>

                {/* Zone */}
                <div className="mt-1 flex items-center gap-1 text-sm text-[#888888]">
                  <MapPin size={13} className="shrink-0" />
                  <span>{a.main_location || 'Zone non renseignée'}</span>
                </div>

                <hr className="my-3 border-border" />

                {/* Description */}
                <p className="text-sm font-[300] text-[#555555]">
                  {a.description || 'Description non renseignée'}
                </p>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/profiles/${a.id}`}
                    className="rounded-lg bg-brand px-4 py-2 text-sm font-[400] text-white"
                  >
                    Voir profil
                  </Link>

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Bonjour, je vous ai trouvé via la plateforme et je souhaite discuter de vos services.`}
                      target="_blank"
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-[400] text-white"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
            } catch (e) {
              return null;
            }
          })}
        </div>
      </div>
    </main>
  );
}
