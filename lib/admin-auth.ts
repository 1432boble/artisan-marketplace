import { NextResponse } from 'next/server';

/**
 * Guard for admin-only API routes.
 *
 * Admin client components send the admin key in the `x-admin-key` header; this
 * compares it against the server-only `ADMIN_UPLOAD_KEY` env var. Returns a 401
 * NextResponse when the request is not authorized, or `null` when it is.
 *
 * Usage at the top of a route handler:
 *   const denied = requireAdmin(req);
 *   if (denied) return denied;
 */
export function requireAdmin(req: Request): NextResponse | null {
  const expected = process.env.ADMIN_UPLOAD_KEY;
  const provided = req.headers.get('x-admin-key');

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  return null;
}
