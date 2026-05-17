import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/articles');
const outputFile = path.join(__dirname, '../frontend/src/app/articles/generatedArticles.ts');
const cacheDir = path.join(__dirname, '../.d2_cache');

// Ensure the output and cache directories exist
if (!fs.existsSync(path.dirname(outputFile))) fs.mkdirSync(path.dirname(outputFile), { recursive: true });
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

async function fetchDiagram(code) {
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const cachePath = path.join(cacheDir, `${hash}.svg`);

    if (fs.existsSync(cachePath)) {
        return fs.readFileSync(cachePath, 'utf8');
    }

    return await new Promise((resolve, reject) => {
        const options = {
            hostname: 'kroki.io',
            path: '/d2/svg',
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    fs.writeFileSync(cachePath, data);
                    resolve(data);
                } else {
                    reject(new Error(`Failed to fetch diagram: ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.write(code);
        req.end();
    });
}

function parseMarkdown(content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;
    
    const fmText = frontmatterMatch[1];
    const metadata = {};
    
    const lines = fmText.split('\n');
    let inFaq = false;
    let inSynonyms = false;
    let currentFaqItem = null;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        if (trimmedLine === 'faq:') { metadata.faq = []; inFaq = true; inSynonyms = false; return; }
        if (trimmedLine === 'synonyms:') { metadata.synonyms = []; inSynonyms = true; inFaq = false; return; }

        if (inFaq) {
            if (trimmedLine.startsWith('- q:')) {
                currentFaqItem = { q: trimmedLine.replace('- q:', '').trim().replace(/^"(.*)"$/, '$1') };
                metadata.faq.push(currentFaqItem);
            } else if (trimmedLine.startsWith('a:')) {
                if (currentFaqItem) currentFaqItem.a = trimmedLine.replace('a:', '').trim().replace(/^"(.*)"$/, '$1');
            } else if (trimmedLine.includes(':') && !trimmedLine.startsWith('-')) {
                inFaq = false;
            }
        } else if (inSynonyms) {
            if (trimmedLine.startsWith('-')) {
                let syn = trimmedLine.replace('-', '').trim().replace(/^"(.*)"$/, '$1');
                if (syn) metadata.synonyms.push(syn);
            } else if (trimmedLine.includes(':')) {
                inSynonyms = false;
            }
        }

        if (!inFaq && !inSynonyms) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                let value = valueParts.join(':').trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
                metadata[key.trim()] = value;
            }
        }
    });

    let body = content.slice(frontmatterMatch[0].length).trim();
    body = body.replace(/—/g, '-').replace(/^(##+)\s+(.*?)\s+\{#(.*?)\}$/gm, '$1 $2');
    
    return { ...metadata, content: body };
}

async function compile() {
    if (!fs.existsSync(contentDir)) return;

    const termFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    const termsRecord = {};
    const usedShortSlugs = new Set();

    for (const file of termFiles) {
        const slug = file.replace('.md', '');
        const mdContent = fs.readFileSync(path.join(contentDir, file), 'utf8');
        const parsed = parseMarkdown(mdContent);
        if (!parsed) continue;

        if (parsed.shortSlug) {
            if (usedShortSlugs.has(parsed.shortSlug)) {
                throw new Error(`Duplicate shortSlug found: "${parsed.shortSlug}" in ${file}`);
            }
            usedShortSlugs.add(parsed.shortSlug);
        } else {
            console.warn(`Warning: No shortSlug defined for ${file}. Automatic interlinking might be limited.`);
        }

        // Extract D2 blocks and pre-fetch them
        const d2Matches = parsed.content.matchAll(/```d2\n([\s\S]*?)\n```/g);
        parsed.d2Cache = {};
        for (const match of d2Matches) {
            const code = match[1];
            try {
                const svg = await fetchDiagram(code);
                parsed.d2Cache[code] = svg;
            } catch (e) {
                console.error(`Error fetching diagram for ${slug}:`, e.message);
            }
        }
        
        termsRecord[slug] = parsed;
    }

    let tsOutput = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.

export interface Article {
  title: string;
  slug: string;
  shortSlug?: string;
  author: string;
  date: string;
  subject: string;
  heroImage: string;
  excerpt: string;
  technicalInsight?: string;
  faq?: Array<{ q: string; a: string }>;
  synonyms?: string[];
  content: string;
  d2Cache?: Record<string, string>;
}

export const articles: Record<string, Article> = ${JSON.stringify(termsRecord, null, 2)};
`;

    fs.writeFileSync(outputFile, tsOutput, 'utf8');
    console.log(`Compiled ${Object.keys(termsRecord).length} articles with D2 pre-rendering to ${outputFile}`);
}

compile();
