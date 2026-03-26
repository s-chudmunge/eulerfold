import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eulerfold.com'
  
  // List of all important URLs for manual submission
  const priorityUrls = [
    // Core pages
    `${baseUrl}/`,
    `${baseUrl}/explore`, 
    `${baseUrl}/help`,
    `${baseUrl}/sitemap`,
    
    // Important roadmaps
    `${baseUrl}/explore/web-development`,
    `${baseUrl}/explore/data-science`,
    `${baseUrl}/explore/machine-learning`, 
    `${baseUrl}/explore/javascript`,
    `${baseUrl}/explore/python`,
    `${baseUrl}/explore/react`,
    
    // Category pages
    `${baseUrl}/explore?category=programming`,
    `${baseUrl}/explore?category=web-development`,
    `${baseUrl}/explore?category=data-science`,
    
    // Difficulty pages  
    `${baseUrl}/explore?difficulty=beginner`,
    `${baseUrl}/explore?difficulty=intermediate`,
    `${baseUrl}/explore?difficulty=advanced`,
    
    // Legal pages
    `${baseUrl}/about`,
    `${baseUrl}/privacy`,
    `${baseUrl}/terms`,
    `${baseUrl}/security`,
  ]

  return NextResponse.json({
    message: 'URLs for manual submission to Google Search Console',
    instructions: [
      '1. Go to Google Search Console',
      '2. Use "URL Inspection" tool', 
      '3. Submit each URL individually',
      '4. Click "Request Indexing" for each',
      '5. Monitor indexing status over 24-48 hours'
    ],
    priority_urls: priorityUrls,
    total_urls: priorityUrls.length,
    submission_method: 'manual_url_inspection',
    expected_indexing_time: '1-7 days per URL'
  })
}