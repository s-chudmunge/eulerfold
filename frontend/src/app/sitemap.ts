import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';
import { papers } from './research-decoded/generatedData';
import { archiveData } from './(public)/archive/generatedArchiveData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eulerfold.com';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/explore',
    '/roadmap',
    '/learn',
    '/research-decoded',
    '/leaderboard',
    '/help',
    '/privacy',
    '/terms',
    '/pricing',
    '/archive/exams/previous-year-papers',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Research Decoded Dynamic Routes (from data.ts)
  const researchDecodedRoutes = Object.keys(papers).map((slug) => ({
    url: `${baseUrl}/research-decoded/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Archive Dynamic Routes (Exams and Papers)
  const archiveRoutes: any[] = [];
  archiveData.forEach((category) => {
    // Exam Category Page
    archiveRoutes.push({
      url: `${baseUrl}/archive/exams/previous-year-papers/${category.id.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    });

    // Individual Paper Pages
    category.entries.forEach((entry) => {
      archiveRoutes.push({
        url: `${baseUrl}/archive/exams/previous-year-papers/${category.id.toLowerCase()}/${entry.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      });
    });
  });

  // 4. Roadmap Dynamic Routes (from Supabase)
  // Fetching public roadmaps from explore view or directly
  let roadmapRoutes: any[] = [];
  try {
    const { data: roadmaps } = await supabase
      .from('roadmaps')
      .select('id, slug, updated_at')
      .eq('is_public', true)
      .limit(1000); // Limit to top 1000 for sitemap performance

    if (roadmaps) {
      roadmapRoutes = roadmaps.map((r) => ({
        url: `${baseUrl}/roadmap/${r.slug}`,
        lastModified: new Date(r.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (e) {
    console.error('Sitemap: Failed to fetch roadmaps', e);
  }

  // 5. User Profile Dynamic Routes (from Supabase)
  let profileRoutes: any[] = [];
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .limit(1000);

    if (profiles) {
      profileRoutes = profiles.map((p) => ({
        url: `${baseUrl}/u/${p.username}`,
        lastModified: new Date(p.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }));
    }
  } catch (e) {
    console.error('Sitemap: Failed to fetch profiles', e);
  }

  return [
    ...staticRoutes,
    ...researchDecodedRoutes,
    ...archiveRoutes,
    ...roadmapRoutes,
    ...profileRoutes,
  ];
}
