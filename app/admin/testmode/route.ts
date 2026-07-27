import { NextResponse } from 'next/server';
import { NOTRACK_COOKIE, NOTRACK_MAX_AGE, checkPassword } from '@/lib/admin-auth';

/**
 * Toggle analytics "test mode" for the current browser.
 *
 *   /admin/testmode?key=YOUR_KEY         → sets the opt-out cookie (~1 year)
 *   /admin/testmode?key=YOUR_KEY&off=1   → clears it, tracking resumes
 *
 * The key is validated against ADMIN_UPLOAD_KEY (server-only). The cookie is
 * read by /api/events, which skips the insert when it is present.
 */

function page(message: string): NextResponse {
  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Biso — Mode test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: flex; align-items: center;
      justify-content: center; padding: 24px;
      background: #F7F7F7; color: #111111;
      font-family: 'Fraunces', serif;
    }
    .card {
      background: #fff; border: 1px solid #eee; border-radius: 14px;
      padding: 28px 24px; max-width: 420px; width: 100%; text-align: center;
      box-shadow: 0 6px 24px rgba(0,0,0,0.06);
    }
    h1 { color: #B03A1A; font-weight: 500; font-size: 20px; margin: 0 0 12px; }
    p { font-weight: 300; font-size: 15px; line-height: 1.5; margin: 0; color: #111; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Biso</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key') ?? '';
  const off = searchParams.get('off') === '1';

  if (!checkPassword(key)) {
    return page('Clé invalide — accès refusé.');
  }

  if (off) {
    const res = page('Mode test désactivé — vos visites sont de nouveau comptabilisées dans les statistiques.');
    res.cookies.set(NOTRACK_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  const res = page('Mode test activé — vos visites ne seront plus comptabilisées dans les statistiques.');
  res.cookies.set(NOTRACK_COOKIE, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: NOTRACK_MAX_AGE,
  });
  return res;
}
