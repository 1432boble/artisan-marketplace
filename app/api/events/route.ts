import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  console.log('[events] POST received');
  try {
    const body = await request.json();
    const { event_type, profile_id, metadata } = body;
    console.log('[events] event_type:', event_type, '| profile_id:', profile_id);

    if (!event_type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error('[events] Missing env vars — url:', !!url, 'key:', !!key);
      return NextResponse.json({ ok: true });
    }

    const supabase = createClient(url, key);

    const { error } = await supabase.from('events').insert({
      event_type,
      profile_id: profile_id ?? null,
      metadata: metadata ?? null,
    });

    if (error) {
      console.error('[events] Supabase insert error:', error.message, error.code);
    } else {
      console.log('[events] inserted ok');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[events] caught exception:', err);
    return NextResponse.json({ ok: true });
  }
}
