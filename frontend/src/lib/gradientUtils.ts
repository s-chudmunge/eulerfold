export type Pattern = 'wave' | 'crisscross' | 'diagonal';

export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function textToGradientConfig(text: string): { 
  colors: [string, string, string, string, string], 
  pattern: Pattern,
  speed: number 
} {
  if (!text || !text.trim()) {
    return {
      colors: ['#00e5ff', '#1565ff', '#0d1fff', '#6a00d4', '#04001a'],
      pattern: 'wave',
      speed: 0.4
    };
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const h = hash % 360;

  const colors: [string, string, string, string, string] = [
    hslToHex(h, 100, 50),
    hslToHex((h + 45) % 360, 90, 55),
    hslToHex((h + 90) % 360, 85, 45),
    hslToHex((h + 160) % 360, 95, 35),
    hslToHex(h, 95, 8)
  ];

  const patterns: Pattern[] = ['wave', 'crisscross', 'diagonal'];
  const pattern = patterns[hash % patterns.length];
  
  const speed = 0.3 + (hash % 50) / 100;

  return { colors, pattern, speed };
}
