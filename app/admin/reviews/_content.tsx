'use client';

import { useEffect, useState } from 'react';

export default function AdminReviewsContent({ adminKey }: { adminKey: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);

    const res = await fetch('/api/admin/reviews', {
      headers: { 'x-admin-key': adminKey },
    });
    const data = await res.json();

    if (Array.isArray(data)) {
      setReviews(data);
    } else {
      alert(data.error || 'Erreur lors du chargement des avis');
      setReviews([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ reviewId, status }),
    });

    const result = await res.json();

    if (result.success) {
      alert(status === 'approved' ? 'Avis approuvé' : 'Avis rejeté');
      fetchReviews();
    } else {
      alert(result.error || 'Erreur');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Avis en attente</h1>

        <p className="mt-1 text-gray-600">
          Approuvez ou rejetez les avis avant publication.
        </p>

        {loading && (
          <div className="mt-4 rounded-xl bg-white p-5 shadow">
            Chargement...
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="mt-4 rounded-xl bg-white p-5 text-gray-600 shadow">
            Aucun avis en attente.
          </div>
        )}

        <div className="mt-4 grid gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-5 shadow">
              <p className="text-sm font-semibold text-blue-700">
                Profil: {r.profiles?.company_name || r.profiles?.contact_name || 'Profil inconnu'}
              </p>

              <p className="mt-2 font-bold text-gray-900">
                Client: {r.client_name || 'Non renseigné'}
              </p>

              <p className="mt-1 text-sm text-gray-700">
                Service reçu: {r.service_received || 'Non renseigné'}
              </p>

              <p className="mt-1 text-sm text-gray-700">
                Date approximative: {r.approximate_date || 'Non renseignée'}
              </p>

              <div className="mt-3 grid gap-1 text-sm text-gray-700">
                <p>Qualité: {r.quality_rating || '-'} / 5</p>
                <p>Propreté: {r.cleanliness_rating || '-'} / 5</p>
                <p>Délais: {r.timeliness_rating || '-'} / 5</p>
                <p>Communication: {r.communication_rating || '-'} / 5</p>
                <p>Professionnalisme: {r.professionalism_rating || '-'} / 5</p>
              </div>

              <p className="mt-3 rounded bg-gray-50 p-3 text-gray-800">
                {r.comment || 'Aucun commentaire'}
              </p>

              {Array.isArray(r.photos) && r.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {r.photos.map((url: string) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt="Photo avis"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}

              <p className="mt-2 text-sm text-gray-600">
                Confirmation client:{' '}
                {r.worked_with_professional ? 'Oui' : 'Non'}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateReviewStatus(r.id, 'approved')}
                  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
                >
                  Approuver
                </button>

                <button
                  onClick={() => updateReviewStatus(r.id, 'rejected')}
                  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
