import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path, tag, secret } = await request.json();
    
    // Basic shared secret check to prevent unauthorized revalidation
    if (secret !== (process.env.REVALIDATE_SECRET || 'eulerfold_revalidate_123')) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    if (path) {
      revalidatePath(path);
    }
    
    if (tag) {
      revalidateTag(tag);
    }
    
    return NextResponse.json({ revalidated: true, now: Date.now(), path, tag });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
