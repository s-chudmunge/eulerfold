import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    // Clean up identifier if full URL was pasted
    let slugOrId = identifier.trim();
    if (slugOrId.includes('/roadmap/')) {
      slugOrId = slugOrId.split('/roadmap/')[1].split('/')[0].split('?')[0];
    }

    let query = supabase.from('roadmaps').select('*');
    if (/^\d+$/.test(slugOrId)) {
      query = query.eq('id', parseInt(slugOrId, 10));
    } else {
      query = query.eq('slug', slugOrId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Roadmap not found', roadmap: null }, { status: 200 });
    }

    let plan = data.roadmap_plan;
    if (typeof plan === 'string') {
      try {
        plan = JSON.parse(plan);
      } catch (e) {
        plan = {};
      }
    }

    return NextResponse.json({
      roadmap: {
        id: data.id,
        title: data.title,
        slug: data.slug,
        plan: plan || {},
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, roadmap: null }, { status: 200 });
  }
}
