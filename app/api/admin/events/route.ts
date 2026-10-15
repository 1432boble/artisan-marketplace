import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

type EventRow = {
  id: number;
  event_type: string;
  profile_id: string | null;
  created_at: string;
};

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

  // The dashboard shows at most 30 days; fetch 31 to cover timezone/midnight
  // edges. This keeps the payload small and well under PostgREST's row cap.
  const since = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();

  // Kick off the profiles query in parallel with the paginated events fetch.
  const profilesPromise = supabase
    .from('profiles')
    .select('id, contact_name, company_name')
    .eq('status', 'approved');

  // PostgREST caps a single response at 1000 rows, so page through with
  // .range() until a page comes back short. Keeps ascending order across pages.
  const PAGE_SIZE = 1000;
  const events: EventRow[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('events')
      .select('id, event_type, profile_id, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('[api/admin/events] events query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const page = data ?? [];
    events.push(...page);
    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  const profilesResult = await profilesPromise;

  if (profilesResult.error) {
    console.error('[api/admin/events] profiles query error:', profilesResult.error);
  }

  return NextResponse.json({
    events,
    profiles: profilesResult.data ?? [],
  });
}
