'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

function cleanWhatsappNumber(phone: string) {
  if (!phone) return '';
  const firstNumber = phone.split('/')[0].trim();
  let cleaned = firstNumber.replace(/\D/g, '');

  if (cleaned.startsWith('0')) cleaned = '225' + cleaned.substring(1);
  if (!cleaned.startsWith('225')) cleaned = '225' + cleaned;

  return cleaned;
}

export default function Home() {
  const [artisans, setArtisans] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [serviceFilter, setServiceFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_services (
            services ( name_fr )
          )
        `)
        .eq('status', 'approved');

      setArtisans(data || []);
      setFiltered(data || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = artisans;

    if (serviceFilter) {
      result = result.filter((a) =>
        a.profile_services?.[0]?.services?.name_fr
          ?.toLowerCase()
          .includes(serviceFilter.toLowerCase())
      );
    }

    if (zoneFilter) {
      result = result.filter((a) =>
        a.main_location?.toLowerCase().includes(zoneFilter.toLowerCase())
      );
    }

    setFiltered(result);
  }, [serviceFilter, zoneFilter, artisans]);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-900">Artisans</h1>
      <p className="mt-1 text-gray-600">
        Trouvez un artisan fiable près de chez vous.
      </p>

      {/* FILTERS */}
      {/* FILTERS */}
<div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow">
  <select
    className="rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-900"
    value={serviceFilter}
    onChange={(e) => setServiceFilter(e.target.value)}
  >
    <option value="">Tous les services</option>
    {Array.from(
      new Set(
        artisans
          .map((a) => a.profile_services?.[0]?.services?.name_fr)
          .filter(Boolean)
      )
    ).map((service) => (
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
    <option value="">Toutes les zones</option>
    {Array.from(
      new Set(artisans.map((a) => a.main_location).filter(Boolean))
    ).map((zone) => (
      <option key={zone} value={zone}>
        {zone}
      </option>
    ))}
  </select>
</div>

      <p className="mt-4 text-gray-700">
        {filtered.length} résultat(s)
      </p>

      {/* LIST */}
      <div className="mt-4 grid gap-4">
        {filtered.map((a) => {
          const service = a.profile_services?.[0]?.services?.name_fr;
          const whatsappNumber = cleanWhatsappNumber(a.whatsapp);

          return (
            <div key={a.id} className="rounded-xl bg-white p-5 shadow">
              <h2 className="flex items-center text-xl font-bold text-gray-900">
                {a.company_name || a.contact_name}

                {a.is_verified && (
                  <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    Vérifié
                  </span>
                )}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                📍 {a.main_location || 'Zone non renseignée'} •{' '}
                {a.experience_years || 'Expérience non renseignée'}
              </p>

              <p className="mt-2 text-sm font-semibold text-blue-700">
                {service || 'Service non renseigné'}
              </p>

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