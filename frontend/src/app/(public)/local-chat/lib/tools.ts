import { API_BASE } from './constants';
import type { SearchResult, FetchResult } from './types';

export function cleanSearchQuery(text: string): string {
  let q = text.trim();
  q = q.replace(
    /^(?:please\s+)?(?:can\s+you\s+)?(?:could\s+you\s+)?(?:search|lookup|find|google|fetch|read|look\s+up|look\s+for)\s+(?:for\s+|about\s+|me\s+|on\s+)?/i,
    ''
  );
  q = q.replace(/[.,;]?\s*(?:and\s+)?(?:summarize|explain|list|provide|show|give me|tell me)[\s\S]*/i, '');
  q = q.replace(/[?!"]/g, '').trim();
  const words = q.split(/\s+/).filter(Boolean).slice(0, 8);
  return words.join(' ') || text.slice(0, 60);
}

export async function runWebSearch(query: string): Promise<{ result: string; searchResults: SearchResult[] }> {
  const cleanQ = cleanSearchQuery(query);

  const attempt = async (q: string) => {
    const res = await fetch(`${API_BASE}/local-tools/search?q=${encodeURIComponent(q)}&limit=5`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.results || []) as SearchResult[];
  };

  let results = await attempt(cleanQ);
  if (results.length === 0 && cleanQ.split(' ').length > 3) {
    const shortQ = cleanQ.split(' ').slice(0, 4).join(' ');
    results = await attempt(shortQ);
  }

  const resultText = results.length > 0
    ? results.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`).join('\n\n')
    : 'No results found.';

  return { result: resultText, searchResults: results };
}

export async function runFetchUrl(url: string): Promise<{ result: string; fetchResult: FetchResult }> {
  const res = await fetch(`${API_BASE}/local-tools/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: FetchResult = await res.json();
  return {
    result: `Page: ${data.title}\nURL: ${data.url}\n\n${data.content}`,
    fetchResult: data,
  };
}
