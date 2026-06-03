import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const profile_id = formData.get('profile_id') as string | null;

    if (!file || !profile_id) {
      return NextResponse.json(
        { success: false, error: 'Missing file or profile_id' },
        { status: 400 }
      );
    }

    const cleanName = file.name.replace(/\s+/g, '-').replace(/[()]/g, '');
    const fileName = `${profile_id}/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('portfolio_photos').insert({
      profile_id,
      photo_url: publicUrlData.publicUrl,
      is_featured: false,
    });

    if (dbError) {
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Upload failed' },
      { status: 500 }
    );
  }
}