'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const LOCATION_OPTIONS = [
  'Abobo',
  'Adjamé',
  'Attécoubé',
  'Bingerville',
  'Cocody',
  'Koumassi',
  'Marcory',
  'Plateau',
  'Port-Bouët',
  'Treichville',
  'Yopougon',
  'Tout Abidjan',
  'Bouaké',
  'Daloa',
  'Korhogo',
  'San-Pédro',
  'Yamoussoukro',
  "Toute la Côte d'Ivoire",
];

const EXPERIENCE_OPTIONS = [
  "Moins d'1 an",
  '1-2 ans',
  '3-5 ans',
  '5-10 ans',
  'Plus de 10 ans',
];

type Service = { id: string; name_fr: string };

export default function NewProfileContent({ adminKey }: { adminKey: string }) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [profileType, setProfileType] = useState<'artisan' | 'company'>('artisan');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mainLocation, setMainLocation] = useState('');
  const [workZones, setWorkZones] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [description, setDescription] = useState('');
  const [otherServices, setOtherServices] = useState('');

  useEffect(() => {
    supabase
      .from('services')
      .select('id, name_fr')
      .eq('is_active', true)
      .order('name_fr')
      .then(({ data }) => {
        if (data) setServices(data);
      });
  }, []);

  function toggleWorkZone(zone: string) {
    setWorkZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  }

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!contactName || !whatsapp || !mainLocation || selectedServices.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires et sélectionner au moins un service.');
      return;
    }

    if (profileType === 'company' && !companyName) {
      alert("Veuillez saisir le nom de l'entreprise.");
      return;
    }

    setLoading(true);

    const res = await fetch('/api/admin/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({
        profile_type: profileType,
        company_name: companyName || null,
        contact_name: contactName,
        whatsapp,
        phone: whatsapp,
        main_location: mainLocation,
        work_zones: workZones.length > 0 ? workZones.join(', ') : null,
        services: selectedServices,
        experience_years: experienceYears || null,
        description: description || null,
        other_services: otherServices || null,
      }),
    });

    const result = await res.json();
    setLoading(false);

    if (result.id) {
      router.push(`/profiles/${result.id}`);
    } else {
      alert(result.error || 'Erreur lors de la création du profil.');
    }
  }

  const primaryServiceName = selectedServices.length > 0
    ? services.find((s) => s.id === selectedServices[0])?.name_fr
    : null;

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Nouveau profil</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Profile type */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">Type de profil</p>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="profileType"
                  value="artisan"
                  checked={profileType === 'artisan'}
                  onChange={() => setProfileType('artisan')}
                />
                Artisan
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="profileType"
                  value="company"
                  checked={profileType === 'company'}
                  onChange={() => setProfileType('company')}
                />
                Entreprise
              </label>
            </div>
          </div>

          {/* Company name */}
          {profileType === 'company' && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                className="w-full rounded border p-3 text-sm text-black"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Bâti Pro SARL"
              />
            </div>
          )}

          {/* Contact name */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Nom du contact *
            </label>
            <input
              type="text"
              className="w-full rounded border p-3 text-sm text-black"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ex: Jean Kouassi"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              WhatsApp / Téléphone *
            </label>
            <input
              type="text"
              className="w-full rounded border p-3 text-sm text-black"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 0701234567"
            />
          </div>

          {/* Main location */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Zone principale *
            </label>
            <select
              className="w-full rounded border bg-white p-3 text-sm text-black"
              value={mainLocation}
              onChange={(e) => setMainLocation(e.target.value)}
            >
              <option value="">Choisir une zone</option>
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Work zones */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">Zones d'intervention</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {LOCATION_OPTIONS.map((zone) => (
                <label key={zone} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={workZones.includes(zone)}
                    onChange={() => toggleWorkZone(zone)}
                  />
                  {zone}
                </label>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="mb-1 text-sm font-semibold text-gray-700">
              Services *{' '}
              <span className="font-normal text-gray-500">
                (le premier coché = service principal)
              </span>
            </p>
            {primaryServiceName && (
              <p className="mb-2 text-xs text-gray-500">
                Principal : <span className="font-semibold text-gray-700">{primaryServiceName}</span>
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {services.map((svc) => (
                <label key={svc.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(svc.id)}
                    onChange={() => toggleService(svc.id)}
                  />
                  {svc.name_fr}
                </label>
              ))}
            </div>
          </div>

          {/* Other services */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Autres services
            </label>
            <input
              type="text"
              className="w-full rounded border p-3 text-sm text-black"
              value={otherServices}
              onChange={(e) => setOtherServices(e.target.value)}
              placeholder="Ex: Jardinage, Peinture murale"
            />
          </div>

          {/* Experience years */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Années d'expérience
            </label>
            <select
              className="w-full rounded border bg-white p-3 text-sm text-black"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            >
              <option value="">Non renseigné</option>
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              className="w-full rounded border p-3 text-sm text-black"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'artisan ou l'entreprise..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer le profil'}
          </button>
        </form>
      </div>
    </main>
  );
}
