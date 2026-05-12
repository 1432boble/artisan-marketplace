import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const [eventsResult, profilesResult] = await Promise.all([
    supabase
      .from('events')
      .select('id, event_type, profile_id, created_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, contact_name, company_name')
      .eq('status', 'approved'),
  ]);

  if (eventsResult.error) {
    return NextResponse.json({ error: eventsResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    events: eventsResult.data ?? [],
    profiles: profilesResult.data ?? [],
  });
}
