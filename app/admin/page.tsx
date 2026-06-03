import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  IconChartLine,
  IconStar,
  IconPhoto,
  IconUserPlus,
} from '@tabler/icons-react';
import { isAuthed } from '@/lib/admin-auth';
import LogoutButton from './_logout';

const TOOLS = [
  { href: '/admin/analytics', label: 'Analytics', desc: 'Statistiques et événements', Icon: IconChartLine },
  { href: '/admin/reviews', label: 'Avis', desc: 'Approuver ou rejeter les avis', Icon: IconStar },
  { href: '/admin/upload', label: 'Photos', desc: 'Téléverser des photos de portfolio', Icon: IconPhoto },
  { href: '/admin/profiles/new', label: 'Nouveau profil', desc: 'Créer un artisan ou une entreprise', Icon: IconUserPlus },
];

export default async function AdminHomePage() {
  if (!(await isAuthed())) {
    redirect('/admin/login?next=/admin');
  }

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-medium" style={{ color: 'var(--brand)' }}>
            Administration
          </h1>
          <LogoutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map(({ href, label, desc, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
              >
                <Icon size={22} stroke={1.5} />
              </span>
              <span>
                <span className="block font-medium" style={{ color: 'var(--ink)' }}>
                  {label}
                </span>
                <span className="mt-0.5 block text-sm font-light" style={{ color: 'var(--muted)' }}>
                  {desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
