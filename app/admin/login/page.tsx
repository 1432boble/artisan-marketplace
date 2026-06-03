import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin-auth';
import LoginForm from './_form';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await isAuthed()) {
    redirect('/admin');
  }

  const { next } = await searchParams;
  // Only allow internal admin paths to avoid open-redirect abuse.
  const safeNext = next && next.startsWith('/admin') ? next : '/admin';

  return <LoginForm next={safeNext} />;
}
