import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('id, title, slug')
      .order('title', { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message, roadmaps: [] }, { status: 200 });
    }

    // Deduplicate by slug
    const uniqueMap = new Map();
    (data || []).forEach((item: any) => {
      if (item.slug && !uniqueMap.has(item.slug)) {
        uniqueMap.set(item.slug, item);
      }
    });

    return NextResponse.json({ roadmaps: Array.from(uniqueMap.values()) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, roadmaps: [] }, { status: 200 });
  }
}
