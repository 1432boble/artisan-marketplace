import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('[api/admin/events] Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const supabase = createClient(url, key);

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
    console.error('[api/admin/events] events query error:', eventsResult.error);
    return NextResponse.json({ error: eventsResult.error.message }, { status: 500 });
  }

  if (profilesResult.error) {
    console.error('[api/admin/events] profiles query error:', profilesResult.error);
  }

  return NextResponse.json({
    events: eventsResult.data ?? [],
    profiles: profilesResult.data ?? [],
  });
}
