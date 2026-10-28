import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isNotrack } from '@/lib/admin-auth';
import { toLoggableQuery } from '@/lib/service-keywords';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, profile_id, metadata } = body;

    if (!event_type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Admin test mode: browsers carrying the opt-out cookie are not recorded.
    if (await isNotrack()) {
      return NextResponse.json({ ok: true });
    }

    // Free text from the public search box: re-check it server-side.
    let safeMetadata = metadata ?? null;
    if (event_type === 'search_unmatched') {
      const query = typeof metadata?.query === 'string' ? toLoggableQuery(metadata.query) : null;
      if (!query) return NextResponse.json({ ok: true });
      safeMetadata = { query };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ ok: true });

    const supabase = createClient(url, key);

    await supabase.from('events').insert({
      event_type,
      profile_id: profile_id ?? null,
      metadata: safeMetadata,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
