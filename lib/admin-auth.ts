import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * Cookie-based admin authentication.
 *
 * The admin password lives in the `ADMIN_UPLOAD_KEY` env var (server-only).
 * On login we set an HttpOnly cookie whose value is a SHA-256 of the password
 * — never the password itself. The cookie is therefore unreadable by JS and
 * the secret never appears in URLs, the client bundle, logs, or referrers.
 */

export const ADMIN_COOKIE = 'biso_admin';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

/**
 * "Ne pas suivre" cookie. When present, analytics events are not recorded —
 * lets an admin browse/test without polluting the dashboard. Set via
 * /admin/testmode?key=… and cleared with &off=1.
 */
export const NOTRACK_COOKIE = 'biso_admin_notrack';
export const NOTRACK_MAX_AGE = 60 * 60 * 24 * 365; // ~1 year, in seconds

/** True when the current request opts out of analytics tracking. */
export async function isNotrack(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(NOTRACK_COOKIE)?.value === 'true';
}

/** Constant-time string comparison that won't throw on length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Deterministic session token derived from the admin secret. */
export function sessionToken(): string | null {
  const secret = process.env.ADMIN_UPLOAD_KEY;
  if (!secret) return null;
  return createHash('sha256').update(secret).digest('hex');
}

/** Verify a submitted password against the admin secret (constant-time). */
export function checkPassword(password: string): boolean {
  const secret = process.env.ADMIN_UPLOAD_KEY;
  if (!secret || !password) return false;
  return safeEqual(password, secret);
}

/** True when the current request carries a valid admin session cookie. */
export async function isAuthed(): Promise<boolean> {
  const expected = sessionToken();
  if (!expected) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  return safeEqual(token, expected);
}

/**
 * Guard for admin API route handlers. Returns a 401 NextResponse when the
 * request has no valid admin session, or `null` when it is authorized.
 *
 * Usage at the top of a route handler:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAuthed()) return null;
  return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
}
