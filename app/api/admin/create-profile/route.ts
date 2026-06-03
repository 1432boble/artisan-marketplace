import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const {
      profile_type,
      company_name,
      contact_name,
      whatsapp,
      phone,
      main_location,
      work_zones,
      services,
      experience_years,
      description,
      other_services,
    } = body;

    if (!contact_name || !phone || !profile_type) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        profile_type,
        company_name: company_name ?? null,
        contact_name,
        phone,
        whatsapp: whatsapp ?? null,
        main_location: main_location ?? null,
        work_zones: work_zones ?? null,
        experience_years: experience_years ?? null,
        description: description ?? null,
        other_services: other_services ?? null,
        status: 'approved',
        is_available: true,
        is_verified: false,
      })
      .select('id')
      .single();

    if (profileError) {
      console.error('Profile insert error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (Array.isArray(services) && services.length > 0) {
      const rows = services.map((serviceId: string, index: number) => ({
        profile_id: profile.id,
        service_id: serviceId,
        is_primary: index === 0,
      }));

      const { error: servicesError } = await supabase
        .from('profile_services')
        .insert(rows);

      if (servicesError) {
        console.error('Profile services insert error:', servicesError);
      }
    }

    return NextResponse.json({ id: profile.id });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
