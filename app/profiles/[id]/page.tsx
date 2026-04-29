'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';

function cleanWhatsappNumber(phone: string) {
  if (!phone) return '';
  const firstNumber = phone.split('/')[0].trim();
  let cleaned = firstNumber.replace(/\D/g, '');

  if (cleaned.startsWith('0')) cleaned = '225' + cleaned.substring(1);
  if (!cleaned.startsWith('225')) cleaned = '225' + cleaned;

  return cleaned;
}

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  const [name, setName] = useState('');
const [rating, setRating] = useState(5);
const [comment, setComment] = useState('');

const submitReview = async () => {
  if (!name || !comment) {
    alert('Veuillez remplir tous les champs');
    return;
  }

  const { error } = await supabase.from('reviews').insert([
    {
      profile_id: id,
      client_name: name,
      rating,
      comment,
      status: 'pending',
      contact_verified: false,
    },
  ]);

  if (error) {
    alert('Erreur: ' + error.message);
    return;
  }

  alert('Merci. Votre avis sera publié après vérification.');

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('profile_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  setReviews(data || []);
  setName('');
  setComment('');
};

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_services (
            services ( name_fr )
          )
        `)
        .eq('id', id)
        .single();

      setProfile(data);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);
    };

    fetchProfile();
  }, [id]);

  if (!profile) return <p className="p-4">Chargement...</p>;

  const averageRating =
  reviews.length > 0
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : null;
  const whatsappNumber = cleanWhatsappNumber(profile.whatsapp);

  const renderStars = (rating: number) => {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
};

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.company_name || profile.contact_name}
        </h1>

        <p className="mt-2 text-gray-600">
          📍 {profile.main_location} • {profile.experience_years}
        </p>

        {profile.is_verified && (
          <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
            Vérifié
          </span>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow">
        <p className="font-semibold text-blue-700">
          {profile.profile_services?.[0]?.services?.name_fr || 'Service non renseigné'}
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow">
        <p className="text-gray-800">
          {profile.description || 'Description non renseignée'}
        </p>
      </div>

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=Bonjour, je vous ai trouvé via la plateforme et je souhaite discuter de vos services.`}
          target="_blank"
          className="mt-6 block rounded-xl bg-green-600 py-3 text-center text-lg font-semibold text-white"
        >
          Contacter sur WhatsApp
        </a>
      )}

      {/* QR Code Section */}
<div className="mt-6 rounded-xl bg-white p-4 shadow">
  <h2 className="mb-3 text-lg font-bold text-gray-900">
    Partager ce profil
  </h2>

  <div className="flex flex-col items-center">
    <QRCodeCanvas
      value={typeof window !== 'undefined' ? window.location.href : ''}
      size={180}
    />

    <p className="mt-3 text-center text-sm text-gray-600">
      Scannez ce code QR pour ouvrir ce profil.
    </p>
    <a
  href={`https://wa.me/?text=Regarde ce profil artisan: ${window.location.href}`}
  target="_blank"
  className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-white font-semibold"
>
  Partager sur WhatsApp
</a>
  </div>
</div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          Avis clients
          </h2>
        {averageRating && (
  <p className="mb-3 text-lg font-bold text-yellow-600">
    ⭐ {renderStars(Number(averageRating))} {averageRating} ({reviews.length} avis)
  </p>
)}

        {reviews.length === 0 && (
          <p className="text-gray-500">Aucun avis pour le moment</p>
        )}

        {reviews.map((r) => (
          <div key={r.id} className="mb-3 border-b pb-3 last:border-b-0">
           <p className="font-semibold text-gray-900">
  ⭐ {renderStars(r.rating)} — {r.client_name}

  {r.contact_verified && (
    <span className="ml-2 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
      Avis vérifié
    </span>
  )}
</p>
            <p className="mt-1 text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-white p-4 shadow">
  <h2 className="mb-3 text-lg font-bold text-gray-900">
    Laisser un avis
  </h2>

  <input
    placeholder="Votre nom"
    className="mb-2 w-full rounded border p-2 text-gray-900"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />

  <select
    className="mb-2 w-full rounded border p-2 text-gray-900"
    value={rating}
    onChange={(e) => setRating(Number(e.target.value))}
  >
    {[5,4,3,2,1].map((r) => (
      <option key={r} value={r}>{r} étoiles</option>
    ))}
  </select>

  <textarea
    placeholder="Votre avis"
    className="mb-2 w-full rounded border p-2 text-gray-900"
    value={comment}
    onChange={(e) => setComment(e.target.value)}
  />

  <button
    onClick={submitReview}
    className="w-full rounded bg-gray-900 py-2 font-semibold text-white"
  >
    Envoyer
  </button>
</div>
    </main>
  );
}