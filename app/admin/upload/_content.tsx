'use client';

import { useEffect, useState } from 'react';

export default function UploadPageContent() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleUpload = async () => {
    if (!file || !selectedProfile) {
      alert('Select artisan and file');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile_id', selectedProfile);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      alert('Upload success');
      location.reload();
    } else {
      alert(result.error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-bold text-gray-900">Upload Photo</h1>

        <select
          className="mb-4 w-full rounded border bg-white p-3 text-black"
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
        >
          <option value="" className="text-black">
            Select artisan
          </option>

          {profiles.map((p) => (
            <option key={p.id} value={p.id} className="text-black">
              {p.company_name || p.contact_name}
            </option>
          ))}
        </select>

        <input
          type="file"
          className="mb-4 w-full"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          className="w-full rounded bg-gray-900 px-4 py-2 font-semibold text-white"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </main>
  );
}
