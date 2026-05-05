'use client';

import { useEffect, useState } from 'react';

export default function UploadPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/get-profiles')
      .then(res => res.json())
      .then(data => {
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
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Photo</h1>

      <select
        className="w-full mb-4 p-3 border rounded bg-white text-black"
  value={selectedProfile}
  onChange={(e) => setSelectedProfile(e.target.value)}
      >
        <option value="" className="text-black">Choisir un artisan</option>

{profiles.map((p) => (
  <option key={p.id} value={p.id} className="text-black">
    {p.company_name || p.contact_name}
  </option>
        ))}
      </select>

      <input
        type="file"
        className="mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="bg-black text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </main>
  );
}