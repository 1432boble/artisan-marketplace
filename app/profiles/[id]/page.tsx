'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import StarRating from '@/components/StarRating';
import { cleanWhatsappNumber } from '@/lib/whatsapp';
import { ArrowLeft, Briefcase, MapPin, User } from 'lucide-react';

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-border pb-3 text-center font-[500] text-ink">
      {children}
    </h2>
  );
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
  const [copied, setCopied] = useState(false);

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

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="font-[300] text-[#888888]">Chargement...</p>
      </div>
    );
  }

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

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-bg pb-10">

      {/* Back link */}
      <div className="bg-white px-4 py-3">
        <button
          onClick={() => router.push('/search')}
          className="inline-flex items-center gap-1.5 text-sm font-[400] text-[#888888]"
        >
          <ArrowLeft size={15} />
          Retour aux artisans
        </button>
      </div>

      {/* Profile header */}
      <div className="mt-2 bg-white px-4 py-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-[500] text-ink">
            {profile.profile_type === 'company'
              ? profile.company_name
              : profile.contact_name}
          </h1>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-[400] text-[#888888]">
            {profile.profile_type === 'company' ? 'Entreprise' : 'Artisan'}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-[300] text-[#888888]">
            <User size={14} className="shrink-0" />
            <span>
              {profile.profile_type === 'company'
                ? profile.contact_name
                : profile.company_name || 'Artisan indépendant'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-[300] text-[#888888]">
            <MapPin size={14} className="shrink-0" />
            <span>{profile.main_location || 'Zone non renseignée'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-[300] text-[#888888]">
            <Briefcase size={14} className="shrink-0" />
            <span>{profile.experience_years || 'Expérience non renseignée'}</span>
          </div>
        </div>

        <p className="mt-4 font-[500] text-brand">
          {profile.profile_services?.length > 0
            ? profile.profile_services
                .map((ps: any) => ps.services?.name_fr)
                .filter(Boolean)
                .join(', ')
            : 'Service non renseigné'}
        </p>

        <div className="mt-2">
          <StarRating rating={averageRating} count={reviews.length} />
        </div>

        {hasCategoryAverages && (
          <div className="mt-4 rounded-xl bg-bg p-4">
            <div className="grid gap-3">
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
                <RatingBar label="Communication / réactivité" value={categoryAverages.communication} />
              )}
              {categoryAverages.professionalism !== null && (
                <RatingBar label="Professionnalisme" value={categoryAverages.professionalism} />
              )}
            </div>
          </div>
        )}

        <p className="mt-4 text-sm font-[300] text-[#666666]">
          {profile.description || 'Description non renseignée'}
        </p>
      </div>

      {/* Contact buttons */}
      <div className="mt-2 bg-white px-4 py-4">
        <div className="flex flex-col gap-3">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=Bonjour, je vous ai trouvé via Biso et je souhaite discuter de vos services.`}
              target="_blank"
              className="block w-full rounded-xl bg-[#25D366] py-4 text-center font-[400] text-white"
            >
              WhatsApp
            </a>
          )}
          {callNumber && (
            <a
              href={`tel:${callNumber}`}
              className="block w-full rounded-xl border-[1.5px] border-brand bg-white py-4 text-center font-[400] text-brand"
            >
              Appeler
            </a>
          )}
        </div>
      </div>

      {/* Réalisations — hidden if no photos */}
      {photos.length > 0 && (
        <div className="mt-2 bg-white px-4 py-5">
          <SectionTitle>Réalisations</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {photos.map((p) => (
              <img
                key={p.id}
                src={p.photo_url?.trim()}
                alt="Réalisation"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="mt-2 bg-white px-4 py-5">
        <SectionTitle>Partager ce profil</SectionTitle>
        <div className="mt-4 flex flex-col items-center gap-3">
          <QRCodeCanvas value={window.location.href} size={180} />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            className="w-full rounded-xl bg-[#25D366] py-3 text-center font-[400] text-white"
          >
            Partager sur WhatsApp
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="w-full rounded-xl border-[1.5px] border-brand bg-white py-3 text-center font-[400] text-brand"
          >
            {copied ? 'Lien copié !' : 'Copier le lien'}
          </button>
        </div>
      </div>

      {/* Reviews list */}
      <div className="mt-2 bg-white px-4 py-5">
        <SectionTitle>Avis clients</SectionTitle>
        {reviews.length === 0 ? (
          <p className="mt-4 text-center font-[300] text-[#888888]">
            Aucun avis pour le moment.
          </p>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="py-4">
                <p className="font-[500] text-ink">
                  <span className="text-yellow-500">{renderStars(r.rating)}</span>
                  {' '}— {r.client_name || 'Client'}
                </p>
                <div className="mt-2 grid gap-1 text-sm font-[300] text-[#888888]">
                  {r.quality_rating && <p>Qualité : {r.quality_rating}/5</p>}
                  {r.cleanliness_rating && <p>Propreté : {r.cleanliness_rating}/5</p>}
                  {r.timeliness_rating && <p>Délais : {r.timeliness_rating}/5</p>}
                  {r.communication_rating && (
                    <p>Communication : {r.communication_rating}/5</p>
                  )}
                  {r.professionalism_rating && (
                    <p>Professionnalisme : {r.professionalism_rating}/5</p>
                  )}
                </div>
                <p className="mt-2 text-sm font-[300] text-[#555555]">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave a review */}
      <div className="mt-2 bg-white px-4 py-5">
        <SectionTitle>Laisser un avis</SectionTitle>
        <p className="mt-3 mb-4 text-center text-sm font-[300] text-[#888888]">
          Votre avis sera vérifié avant publication.
        </p>

        <input
          placeholder="Votre nom"
          className="mb-3 w-full rounded-xl border-[1.5px] border-brand bg-white p-3 font-[300] text-brand placeholder:opacity-50"
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
          className="mb-3 w-full rounded-xl border-[1.5px] border-brand bg-white p-3 font-[300] text-brand placeholder:opacity-50"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <label className="mb-4 flex gap-2 text-sm font-[300] text-[#888888]">
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
          className="w-full rounded-xl bg-brand py-4 font-[400] text-white disabled:opacity-60"
        >
          {submitting ? 'Envoi...' : "Envoyer l'avis"}
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
    <label className="mb-3 block text-sm font-[300] text-[#888888]">
      {label}
      <select
        className="mt-1 w-full rounded-xl border-[1.5px] border-brand bg-white p-3 font-[300] text-brand"
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
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-[300] text-[#888888]">{label}</span>
        <span className="font-[500] text-ink">{value.toFixed(1)}/5</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-accent"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
