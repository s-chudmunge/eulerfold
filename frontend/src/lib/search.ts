export const FILLER_PHRASES = [
  "i want to learn",
  "i want to",
  "how to learn",
  "how to",
  "i need to learn",
  "teach me",
  "roadmap for",
  "roadmap to",
  "guide to",
  "everything about",
  "from scratch",
  "for beginners",
  "beginner to advanced",
  "step by step",
  "paper on",
  "paper about",
  "research on",
  "research about",
  " and ",
  " with ",
  " the ",
  " in ",
  " of ",
  " for "
];

export function cleanSearchQuery(query: string): string {
  if (!query) return "";

  let q = query.toLowerCase().trim();

  // Remove common filler phrases
  for (const phrase of FILLER_PHRASES) {
    q = q.replace(new RegExp(`\\b${phrase}\\b`, 'g'), "");
  }

  // Remove leading/trailing "learn"
  q = q.replace(/^\s*learn\s+/g, "");
  q = q.replace(/\s+learn\s*$/g, "");

  // Remove extra whitespace
  q = q.replace(/\s+/g, " ").trim();

  // If everything was cleaned away, return original without special chars
  if (!q) {
    return query.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  }

  return q;
}

export function getSearchKeywords(query: string): string[] {
  const cleaned = cleanSearchQuery(query);
  return cleaned.split(/\s+/).filter(word => word.length > 1 || !isNaN(Number(word)));
}
