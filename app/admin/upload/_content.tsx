'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type UploadResult = { name: string; ok: boolean; error?: string };

const BRAND = '#B03A1A';

export default function UploadPageContent() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [featureFirst, setFeatureFirst] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<UploadResult[] | null>(null);

  useEffect(() => {
    fetch('/api/get-profiles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProfiles(data);
        } else {
          alert(data.error || 'Failed to load profiles');
          setProfiles([]);
        }
      });
  }, []);

  // Free the object URLs when the previews change or the component unmounts,
  // so selecting new batches doesn't leak memory.
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
    setResults(null);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !selectedProfile) {
      alert('Sélectionnez un artisan et au moins une photo');
      return;
    }

    setLoading(true);
    setResults(null);

    const collected: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('profile_id', selectedProfile);
      // Only the first photo may be featured, and only when the admin opts in.
      formData.append('is_featured', String(i === 0 && featureFirst));

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        if (result.success) {
          collected.push({ name: file.name, ok: true });
        } else {
          collected.push({ name: file.name, ok: false, error: result.error });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur réseau';
        collected.push({ name: file.name, ok: false, error: message });
      }
    }

    setResults(collected);
    setLoading(false);
    setProgress({ current: 0, total: 0 });
  };

  const successCount = results?.filter((r) => r.ok).length ?? 0;
  const failed = results?.filter((r) => !r.ok) ?? [];

  return (
    <main className="min-h-screen bg-[#F7F7F7] p-6 text-[#111111]">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-medium" style={{ color: BRAND }}>
          Ajouter des photos
        </h1>

        <select
          className="mb-4 w-full rounded-xl border bg-white p-3 text-black"
          style={{ borderColor: BRAND, borderWidth: 1.5 }}
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
        >
          <option value="" className="text-black">
            Sélectionner un artisan
          </option>

          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="text-black">
              {p.company_name || p.contact_name}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          multiple
          className="mb-4 w-full"
          onChange={handleSelect}
        />

        {files.length > 0 && (
          <>
            <p className="mb-2 text-sm font-light text-[#888888]">
              {files.length} photo{files.length > 1 ? 's' : ''} sélectionnée
              {files.length > 1 ? 's' : ''}
            </p>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div
                  key={src}
                  className="relative overflow-hidden rounded-xl border border-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={files[i]?.name ?? `photo ${i + 1}`}
                    className="h-24 w-full object-cover"
                  />
                  {i === 0 && featureFirst && (
                    <span
                      className="absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      En vedette
                    </span>
                  )}
                </div>
              ))}
            </div>

            <label className="mb-4 flex items-center gap-2 text-sm font-light">
              <input
                type="checkbox"
                checked={featureFirst}
                onChange={(e) => setFeatureFirst(e.target.checked)}
              />
              Mettre la première photo en vedette
            </label>
          </>
        )}

        <button
          onClick={handleUpload}
          className="w-full rounded-xl px-4 py-3 font-normal text-white disabled:opacity-60"
          style={{ backgroundColor: BRAND }}
          disabled={loading}
        >
          {loading
            ? `Envoi ${progress.current} sur ${progress.total}...`
            : 'Envoyer'}
        </button>

        {results && (
          <div className="mt-4 rounded-xl border border-gray-200 p-3 text-sm">
            <p className="font-medium" style={{ color: '#1A7A3C' }}>
              {successCount} photo{successCount > 1 ? 's' : ''} envoyée
              {successCount > 1 ? 's' : ''} avec succès
            </p>

            {failed.length > 0 && (
              <div className="mt-2">
                <p className="font-medium" style={{ color: BRAND }}>
                  {failed.length} échec{failed.length > 1 ? 's' : ''} :
                </p>
                <ul className="mt-1 list-disc pl-5 font-light text-[#888888]">
                  {failed.map((f) => (
                    <li key={f.name}>
                      {f.name}
                      {f.error ? ` — ${f.error}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
