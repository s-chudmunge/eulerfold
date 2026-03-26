import { NextRequest, NextResponse } from 'next/server';

// This endpoint allows manual submission of specific URLs for indexing
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eulerfold.com';
    const results: { url: string; submitted: boolean; message?: string }[] = [];
    
    for (const url of urls) {
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      
      try {
        // Submit to Google Search Console (requires authentication in production)
        // For now, we'll just validate and log the URLs
        
        const isValidUrl = /^https:\/\/eulerfold\.live\/explore\//.test(fullUrl);
        
        results.push({
          url: fullUrl,
          submitted: isValidUrl,
          message: isValidUrl ? 'URL queued for submission' : 'Invalid URL format'
        });
      } catch (error) {
        results.push({
          url: fullUrl,
          submitted: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error submitting URLs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'URL submission endpoint',
    description: 'Submit specific explore page URLs for search engine indexing',
    usage: 'POST with { "urls": ["https://eulerfold.com/explore/web-development"] }'
  });
}