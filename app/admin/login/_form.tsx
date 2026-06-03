'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Veuillez saisir le mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push(next);
        router.refresh();
      } else {
        setError(data.error || 'Connexion échouée.');
        setLoading(false);
      }
    } catch {
      setError('Erreur réseau. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1
          className="text-xl font-medium"
          style={{ color: 'var(--brand)' }}
        >
          Espace administrateur
        </h1>
        <p className="mt-1 text-sm font-light" style={{ color: 'var(--muted)' }}>
          Saisissez le mot de passe pour continuer.
        </p>

        <label
          className="mt-5 block text-sm font-light"
          style={{ color: 'var(--ink)' }}
          htmlFor="admin-password"
        >
          Mot de passe
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl bg-white px-3 py-2.5 outline-none"
          style={{ border: '1.5px solid var(--brand)', color: 'var(--ink)' }}
          autoFocus
        />

        {error && (
          <p
            className="mt-3 rounded-lg p-2.5 text-sm"
            style={{ background: '#FEF2F2', color: '#991B1B' }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl py-2.5 font-normal text-white disabled:opacity-60"
          style={{ background: 'var(--brand)' }}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
