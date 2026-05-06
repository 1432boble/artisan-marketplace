'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import StarRating from '@/components/StarRating';

function cleanWhatsappNumber(phone: string) {
  if (!phone) return '';
  const firstNumber = phone.split('/')[0].trim();
  let cleaned = firstNumber.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '225' + cleaned.substring(1);
  if (!cleaned.startsWith('225')) cleaned = '225' + cleaned;
  return cleaned;
}

function cleanCallNumber(phone: string) {
  if (!phone) return '';
  const firstNumber = phone.split('/')[0].trim();
  let cleaned = firstNumber.replace(/\D/g, '');

  if (cleaned.startsWith('225') && cleaned.length > 10) {
    cleaned = cleaned.substring(3);
  }

  return cleaned;
}

function renderStars(rating: number) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function averageCategory(reviews: any[], field: string) {
  const values = reviews
    .map((r) => r[field])
    .filter((value) => typeof value === 'number');

  if (values.length === 0) return null;

  const average =
    values.reduce((sum, value) => sum + value, 0) / values.length;

  return average;
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  const [clientName, setClientName] = useState('');
  const [qualityRating, setQualityRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [professionalismRating, setProfessionalismRating] = useState(5);
  const [comment, setComment] = useState('');
  const [workedWithProfessional, setWorkedWithProfessional] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          *,
        profile_services (
          services ( name_fr )
        )
   `)
   .eq('id', id)
   .single();

      setProfile(profileData);

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      setReviews(reviewData || []);

      const { data: photoData } = await supabase
        .from('portfolio_photos')
        .select('*')
        .eq('profile_id', id);

      setPhotos(photoData || []);
    };

    fetchData();
  }, [id]);

  if (!profile) return <p className="p-4 text-gray-900">Chargement...</p>;

  const whatsappNumber = cleanWhatsappNumber(profile.whatsapp);
  const callNumber = cleanCallNumber(profile.whatsapp || profile.phone);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const categoryAverages = {
  quality: averageCategory(reviews, 'quality_rating'),
  cleanliness: averageCategory(reviews, 'cleanliness_rating'),
  timeliness: averageCategory(reviews, 'timeliness_rating'),
  communication: averageCategory(reviews, 'communication_rating'),
  professionalism: averageCategory(reviews, 'professionalism_rating'),
};

const hasCategoryAverages = Object.values(categoryAverages).some(
  (value) => value !== null
);
    

  const submitReview = async () => {
    if (!clientName || !comment || !workedWithProfessional) {
      alert(
        'Veuillez remplir votre nom, ajouter un commentaire et confirmer que vous avez travaillé avec ce professionnel.'
      );
      return;
    }

    const overallRating =
      (qualityRating +
        cleanlinessRating +
        timelinessRating +
        communicationRating +
        professionalismRating) /
      5;

    setSubmitting(true);

    const { error } = await supabase.from('reviews').insert({
      profile_id: id,
      client_name: clientName,
      quality_rating: qualityRating,
      cleanliness_rating: cleanlinessRating,
      timeliness_rating: timelinessRating,
      communication_rating: communicationRating,
      professionalism_rating: professionalismRating,
      rating: Math.round(overallRating),
      comment,
      worked_with_professional: workedWithProfessional,
      contact_verified: false,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      alert('Erreur: ' + error.message);
      return;
    }

    alert('Merci. Votre avis sera publié après vérification.');

    setClientName('');
    setQualityRating(5);
    setCleanlinessRating(5);
    setTimelinessRating(5);
    setCommunicationRating(5);
    setProfessionalismRating(5);
    setComment('');
    setWorkedWithProfessional(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900">
      <button
        onClick={() => router.push('/search')}
        className="mb-4 inline-flex font-semibold text-gray-700"
      >
        ← Retour aux artisans
      </button>

      <div className="rounded-xl bg-white p-5 shadow">
  <div className="flex items-start justify-between gap-3">
    <h1 className="text-2xl font-bold text-gray-900">
      {profile.profile_type === 'company'
        ? profile.company_name
        : profile.contact_name}
    </h1>

    <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
      {profile.profile_type === 'company' ? 'Entreprise' : 'Artisan'}
    </span>
  </div>

  <p className="mt-1 text-sm font-semibold text-gray-700">
    {profile.profile_type === 'company'
      ? `Contact: ${profile.contact_name}`
      : profile.company_name || 'Artisan indépendant'}
  </p>

  {profile.is_verified && (
    <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
      Vérifié
    </span>
  )}

  <div className="mt-2 space-y-1 text-gray-700">
    <p>
      📍 Zone couverte : {profile.main_location || 'Zone non renseignée'}
    </p>
    <p>
      Expérience : {profile.experience_years || 'Expérience non renseignée'}
    </p>
  </div>
</div>

      <div className="mt-4 rounded-xl bg-white p-5 shadow">
        <p className="text-sm font-semibold text-blue-700">
          {profile.profile_services?.length > 0
  ? profile.profile_services
      .map((ps: any) => ps.services?.name_fr)
      .filter(Boolean)
      .join(', ')
  : 'Service non renseigné'}
        </p>

        <StarRating rating={averageRating} count={reviews.length} />

        {hasCategoryAverages && (
  <div className="mt-4 max-w-xl rounded-lg bg-gray-50 p-4">
  
    <div className="grid gap-3 text-sm text-gray-700">
      {categoryAverages.quality !== null && (
        <RatingBar label="Qualité du travail" value={categoryAverages.quality} />
      )}

      {categoryAverages.cleanliness !== null && (
        <RatingBar label="Propreté" value={categoryAverages.cleanliness} />
      )}

      {categoryAverages.timeliness !== null && (
        <RatingBar label="Respect des délais" value={categoryAverages.timeliness} />
      )}

      {categoryAverages.communication !== null && (
        <RatingBar
          label="Communication / réactivité"
          value={categoryAverages.communication}
        />
      )}

      {categoryAverages.professionalism !== null && (
        <RatingBar
          label="Professionnalisme"
          value={categoryAverages.professionalism}
        />
      )}
    </div>
  </div>
)}

        <p className="mt-4 text-gray-800">
          {profile.description || 'Description non renseignée'}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=Bonjour, je vous ai trouvé via Biso et je souhaite discuter de vos services.`}
            target="_blank"
            className="block rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white"
          >
            WhatsApp
          </a>
        )}

        {callNumber && (
          <a
            href={`tel:${callNumber}`}
            className="block rounded-lg bg-gray-900 px-4 py-3 text-center font-semibold text-white"
          >
            Appeler
          </a>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-center text-lg font-bold text-gray-900">Réalisations</h2>

        {photos.length === 0 ? (
          <p className="text-center text-gray-600">Aucune photo disponible</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((p) => (
              <img
                key={p.id}
                src={p.photo_url?.trim()}
                alt="Réalisation"
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-center text-lg font-bold text-gray-900">
          Partager ce profil
        </h2>

        <div className="flex flex-col items-center">
          <QRCodeCanvas value={window.location.href} size={180} />

          <p className="mt-3 text-center text-sm text-gray-600">
            Scannez ce code QR pour ouvrir ce profil.
          </p>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
          >
            Partager sur WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Avis clients</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-600">Aucun avis pour le moment</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-t py-3">
              <p className="font-semibold text-gray-900">
                <span className="text-yellow-600">
                  {renderStars(r.rating)}
                </span>{' '}
                — {r.client_name || 'Client'}
              </p>

              <div className="mt-2 grid gap-1 text-sm text-gray-700">
                {r.quality_rating && <p>Qualité: {r.quality_rating}/5</p>}
                {r.cleanliness_rating && <p>Propreté: {r.cleanliness_rating}/5</p>}
                {r.timeliness_rating && <p>Délais: {r.timeliness_rating}/5</p>}
                {r.communication_rating && (
                  <p>Communication: {r.communication_rating}/5</p>
                )}
                {r.professionalism_rating && (
                  <p>Professionnalisme: {r.professionalism_rating}/5</p>
                )}
              </div>

              <p className="mt-2 text-gray-700">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Laisser un avis
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          Votre avis sera vérifié avant publication.
        </p>

        <input
          placeholder="Votre nom"
          className="mb-3 w-full rounded border border-gray-300 bg-white p-3 text-gray-900"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        
        <RatingSelect
          label="Qualité du travail"
          value={qualityRating}
          onChange={setQualityRating}
        />
        <RatingSelect
          label="Propreté"
          value={cleanlinessRating}
          onChange={setCleanlinessRating}
        />
        <RatingSelect
          label="Respect des délais"
          value={timelinessRating}
          onChange={setTimelinessRating}
        />
        <RatingSelect
          label="Communication / réactivité"
          value={communicationRating}
          onChange={setCommunicationRating}
        />
        <RatingSelect
          label="Sérieux / professionnalisme"
          value={professionalismRating}
          onChange={setProfessionalismRating}
        />

        <textarea
          placeholder="Votre commentaire"
          className="mb-3 w-full rounded border border-gray-300 bg-white p-3 text-gray-900"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <label className="mb-4 flex gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={workedWithProfessional}
            onChange={(e) => setWorkedWithProfessional(e.target.checked)}
          />
          Je confirme avoir réellement travaillé avec ce professionnel.
        </label>

        <button
          onClick={submitReview}
          disabled={submitting}
          className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white"
        >
          {submitting ? 'Envoi...' : 'Envoyer l’avis'}
        </button>
      </div>
    </main>
  );
}

function RatingSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-3 block text-sm font-semibold text-gray-800">
      {label}
      <select
        className="mt-1 w-full rounded border border-gray-300 bg-white p-3 text-gray-900"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((rating) => (
          <option key={rating} value={rating}>
            {rating} / 5
          </option>
        ))}
      </select>
    </label>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="font-semibold text-gray-900">
          {value.toFixed(1)}/5
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-amber-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}