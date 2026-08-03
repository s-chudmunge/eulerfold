import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; EulerFold-Bot/1.0; +https://www.eulerfold.com)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP ${response.status}`, text: '' },
        { status: 200 } // Return 200 so client can handle gracefully
      );
    }

    const contentType = response.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('text/html')) {
      const html = await response.text();
      // Strip HTML tags, scripts, styles, and collapse whitespace
      text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s{2,}/g, ' ')
        .trim();
      // Cap at ~20k chars to avoid crushing the prompt context
      text = text.slice(0, 20000);
    } else if (contentType.includes('text/plain')) {
      text = (await response.text()).slice(0, 20000);
    } else {
      text = '';
    }

    return NextResponse.json({ text, url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, text: '' }, { status: 200 });
  }
}
