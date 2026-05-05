'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

function renderStars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      setProfile(profileData);

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id', id)
        .eq('status', 'approved');

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
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900">
      <button
        onClick={() => router.push('/search')}
        className="mb-4 inline-flex font-semibold text-gray-700"
      >
        ← Retour aux artisans
      </button>

      <div className="rounded-xl bg-white p-5 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.profile_type === 'company'
            ? profile.company_name
            : profile.contact_name}
        </h1>

        <p className="mt-1 text-sm font-semibold text-gray-700">
          {profile.profile_type === 'company'
            ? `Contact: ${profile.contact_name}`
            : profile.company_name || 'Artisan indépendant'}
        </p>

        <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
          {profile.profile_type === 'company' ? 'Entreprise' : 'Artisan'}
        </span>

        {profile.is_verified && (
          <span className="ml-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
            Vérifié
          </span>
        )}

        <p className="mt-2 text-gray-700">
          📍 {profile.main_location || 'Zone non renseignée'} •{' '}
          {profile.experience_years || 'Expérience non renseignée'}
        </p>
      </div>

      <div className="mt-4 rounded-xl bg-white p-5 shadow">
        <p className="text-sm font-semibold text-blue-700">
          {profile.main_service_name || 'Service non renseigné'}
        </p>

        {averageRating && (
          <p className="mt-2 font-semibold text-yellow-600">
            ⭐ {averageRating.toFixed(1)}/5 ({reviews.length} avis)
          </p>
        )}

        <p className="mt-4 text-gray-800">
          {profile.description || 'Description non renseignée'}
        </p>
      </div>

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=Bonjour, je vous ai trouvé via la plateforme et je souhaite discuter de vos services.`}
          target="_blank"
          className="mt-4 block rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white"
        >
          Contacter sur WhatsApp
        </a>
      )}

      <div className="mt-6 rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Réalisations</h2>

        {photos.length === 0 ? (
          <p className="text-gray-600">Aucune photo disponible</p>
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
        <h2 className="mb-3 text-lg font-bold text-gray-900">Partager ce profil</h2>

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
                <span className="text-yellow-600">{renderStars(r.rating)}</span>{' '}
                — {r.client_name || r.name || 'Client'}
              </p>
              <p className="mt-1 text-gray-700">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}