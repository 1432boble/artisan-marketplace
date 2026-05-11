import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, profile_id, metadata } = body;

    if (!event_type) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ ok: true });

    const supabase = createClient(url, key);

    await supabase.from('events').insert({
      event_type,
      profile_id: profile_id ?? null,
      metadata: metadata ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
