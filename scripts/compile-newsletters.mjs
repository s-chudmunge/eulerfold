import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/newsletters');
const outputFile = path.join(__dirname, '../frontend/src/app/newsletters/generatedNewsletters.ts');

if (!fs.existsSync(path.dirname(outputFile))) fs.mkdirSync(path.dirname(outputFile), { recursive: true });

function parseMarkdown(content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;
    
    const fmText = frontmatterMatch[1];
    const metadata = {};
    
    const lines = fmText.split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            let value = valueParts.join(':').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
            metadata[key.trim()] = value;
        }
    });

    let body = content.slice(frontmatterMatch[0].length).trim();
    
    return { ...metadata, content: body };
}

function compile() {
    if (!fs.existsSync(contentDir)) return;

    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    const records = {};

    for (const file of files) {
        const slug = file.replace('.md', '');
        const mdContent = fs.readFileSync(path.join(contentDir, file), 'utf8');
        const parsed = parseMarkdown(mdContent);
        if (!parsed) continue;

        records[slug] = parsed;
    }

    let tsOutput = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.

export interface Newsletter {
  title: string;
  subtitle?: string;
  hero_image_url?: string;
  slug: string;
  author: string;
  date: string;
  content: string;
}

export const newsletters: Record<string, Newsletter> = ${JSON.stringify(records, null, 2)};
`;

    fs.writeFileSync(outputFile, tsOutput, 'utf8');
    console.log(`Compiled ${Object.keys(records).length} newsletters to ${outputFile}`);
}

compile();
