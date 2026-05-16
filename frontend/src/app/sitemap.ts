import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';
import { papers } from './research-decoded/generatedData';
import { archiveData } from './(public)/archive/generatedArchiveData';
import { articles } from './articles/generatedArticles';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.eulerfold.com';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/explore',
    '/roadmap',
    '/learn',
    '/research-decoded',
    '/articles',
    '/leaderboard',
    '/help',
    '/privacy',
    '/terms',
    '/pricing',
    '/about',
    '/careers',
    '/sitemap',
    '/planner',
    '/buildpilot',
    '/practice',
    '/generate',
    '/research-lab',
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
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 3. Articles Dynamic Routes (from generatedArticles.ts)
  const articleRoutes = Object.keys(articles).map((slug) => ({
    url: `${baseUrl}/articles/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 4. Archive Dynamic Routes (Exams and Papers)
  const archiveRoutes: any[] = [];
  archiveData.forEach((category) => {
    // Exam Category Page
    archiveRoutes.push({
      url: `${baseUrl}/archive/exams/previous-year-papers/${category.id.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    });

    // Individual Paper Pages
    category.entries.forEach((entry) => {
      archiveRoutes.push({
        url: `${baseUrl}/archive/exams/previous-year-papers/${category.id.toLowerCase()}/${entry.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      });
    });
  });

  // 5. Roadmap Dynamic Routes (from Supabase)
  // Fetching public roadmaps from explore view or directly
  let roadmapRoutes: any[] = [];
  try {
    const { data: roadmaps } = await supabase
      .from('roadmaps')
      .select('id, slug, updated_at')
      .eq('is_public', true)
      .limit(500); // Limit to top 500 for sitemap performance

    if (roadmaps) {
      roadmapRoutes = roadmaps.map((r) => ({
        url: `${baseUrl}/roadmap/${r.slug}`,
        lastModified: new Date(r.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Sitemap: Failed to fetch roadmaps', e);
  }

  // 6. User Profile Dynamic Routes (from Supabase)
  let profileRoutes: any[] = [];
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, created_at')
      .not('username', 'is', null)
      .limit(500);

    if (profiles) {
      profileRoutes = profiles.map((p) => ({
        url: `${baseUrl}/u/${p.username}`,
        lastModified: new Date(p.created_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      }));
    }
  } catch (e) {
    console.error('Sitemap: Failed to fetch profiles', e);
  }

  return [
    ...staticRoutes,
    ...roadmapRoutes,
    ...profileRoutes,
    ...researchDecodedRoutes,
    ...articleRoutes,
    ...archiveRoutes,
  ];
}
