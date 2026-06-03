'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-xl border px-4 py-2 text-sm font-normal disabled:opacity-60"
      style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
    >
      {loading ? 'Déconnexion…' : 'Se déconnecter'}
    </button>
  );
}
