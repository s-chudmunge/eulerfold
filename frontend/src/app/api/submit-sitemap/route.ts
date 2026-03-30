import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eulerfold.com';
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  
  try {
    const results: { service: string; success: boolean; message?: string }[] = [];
    
    // Submit to Google
    try {
      const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const googleResponse = await fetch(googleUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      results.push({
        service: 'Google',
        success: googleResponse.ok,
        message: googleResponse.ok ? 'Submitted successfully' : `Error: ${googleResponse.status}`
      });
    } catch (error) {
      results.push({
        service: 'Google',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Submit to Bing
    try {
      const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const bingResponse = await fetch(bingUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      results.push({
        service: 'Bing',
        success: bingResponse.ok,
        message: bingResponse.ok ? 'Submitted successfully' : `Error: ${bingResponse.status}`
      });
    } catch (error) {
      results.push({
        service: 'Bing',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return NextResponse.json({
      success: true,
      sitemapUrl,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error submitting sitemap:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to submit sitemap to search engines',
    endpoint: '/api/submit-sitemap',
    method: 'POST'
  });
}