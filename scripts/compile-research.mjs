import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/research-decoded');
const navFile = path.join(contentDir, 'navigation.json');
const outputFile = path.join(__dirname, '../frontend/src/app/research-decoded/generatedData.ts');

function escapeTS(str) {
    if (str === null) return 'null';
    return JSON.stringify(str);
}

function parseMarkdown(content, slug) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;
    
    const fmText = frontmatterMatch[1];
    const getFm = (key) => {
        const m = fmText.match(new RegExp(`^${key}:\\s*(.*)`, 'm'));
        if (!m) return undefined; // Key missing
        try {
            return JSON.parse(m[1]);
        } catch (e) {
            return m[1].replace(/^"(.*)"$/, '$1');
        }
    };

    const title = getFm('title') || slug;
    const authors = getFm('authors') || "Unknown";
    const citation = getFm('citation') || "";
    const link = getFm('link') || "";
    const heroImage = getFm('heroImage');

    let body = content.slice(frontmatterMatch[0].length).trim();
    body = body.replace(/^#\s+.*?\n+/, '');

    const firstH2Index = body.indexOf('## ');
    let intro = firstH2Index === -1 ? body.trim() : body.slice(0, firstH2Index).trim();

    const sections = [];
    const resources = [];
    const parts = body.split(/(?=^## )/m);
    
    for (const part of parts) {
        if (!part.startsWith('## ')) continue;
        
        const lines = part.split('\n');
        const header = lines[0].replace('## ', '').trim();
        const idMatch = header.match(/(.*) \{#(.*)\}$/);
        let sectionTitle = header;
        let sectionId = header.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        if (idMatch) {
            sectionTitle = idMatch[1].trim();
            sectionId = idMatch[2].trim();
        }

        let sectionContent = lines.slice(1).join('\n').trim();
        
        // Strip custom IDs from ### subheadings to prevent them from rendering as text
        sectionContent = sectionContent.replace(/^###\s+(.*?)\s+\{#(.*?)\}$/gm, '### $1');

        if (sectionTitle === 'Resources') {
            const resLines = sectionContent.split('\n');
            for (const rLine of resLines) {
                const linkMatch = rLine.match(/- \[(.*?)\]\((.*?)\)\s*\{type:\s*(.*?),\s*provider:\s*(.*?)\}/);
                if (linkMatch) {
                    resources.push({
                        title: linkMatch[1],
                        url: linkMatch[2],
                        type: linkMatch[3],
                        provider: linkMatch[4]
                    });
                }
            }
        } else {
            let diagram = null;
            const diagMatch = sectionContent.match(/!\[(.*?)\]\((.*?)\)\n\n_(.*?)_/);
            if (diagMatch) {
                diagram = {
                    url: diagMatch[2],
                    caption: diagMatch[3]
                };
                sectionContent = sectionContent.replace(diagMatch[0], '').trim();
            }

            sections.push({
                id: sectionId,
                title: sectionTitle,
                content: sectionContent,
                diagram: diagram
            });
        }
    }

    return { title, authors, citation, link, heroImage, intro, sections, resources };
}

function compile() {
    const navData = JSON.parse(fs.readFileSync(navFile, 'utf8'));
    const orderedSlugs = [];
    for (const cat of navData) {
        for (const sec of cat.sections) {
            orderedSlugs.push(sec.slug);
        }
    }

    const papersRecord = {};
    for (let i = 0; i < orderedSlugs.length; i++) {
        const slug = orderedSlugs[i];
        const mdPath = path.join(contentDir, `${slug}.md`);
        if (!fs.existsSync(mdPath)) continue;

        const parsed = parseMarkdown(fs.readFileSync(mdPath, 'utf8'), slug);
        if (!parsed) continue;

        papersRecord[slug] = {
            ...parsed,
            next: i < orderedSlugs.length - 1 ? orderedSlugs[i + 1] : null,
            prev: i > 0 ? orderedSlugs[i - 1] : null
        };
    }

    let tsOutput = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
export interface Paper {
  title: string;
  authors: string;
  citation: string;
  link: string;
  heroImage?: string | null;
  intro: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    diagram?: {
      url: string;
      caption: string;
    };
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: string;
    provider: string;
  }>;
  next: string | null;
  prev: string | null;
}

export const navigation = ${JSON.stringify(navData, null, 2)};

export const papers: Record<string, Paper> = {\n`;

    const slugs = Object.keys(papersRecord);
    slugs.forEach((slug, i) => {
        const p = papersRecord[slug];
        tsOutput += `  "${slug}": {\n`;
        tsOutput += `    title: ${escapeTS(p.title)},\n`;
        tsOutput += `    authors: ${escapeTS(p.authors)},\n`;
        tsOutput += `    citation: ${escapeTS(p.citation)},\n`;
        tsOutput += `    link: ${escapeTS(p.link)},\n`;
        if (p.heroImage !== undefined) {
            tsOutput += `    heroImage: ${escapeTS(p.heroImage)},\n`;
        }
        tsOutput += `    intro: ${escapeTS(p.intro)},\n`;
        tsOutput += `    sections: [\n`;
        p.sections.forEach((s, j) => {
            tsOutput += `      {\n`;
            tsOutput += `        id: ${escapeTS(s.id)},\n`;
            tsOutput += `        title: ${escapeTS(s.title)},\n`;
            tsOutput += `        content: ${escapeTS(s.content)}${s.diagram ? ',\n        diagram: {\n          url: ' + escapeTS(s.diagram.url) + ',\n          caption: ' + escapeTS(s.diagram.caption) + '\n        }' : ''}\n`;
            tsOutput += `      }${j < p.sections.length - 1 ? ',' : ''}\n`;
        });
        tsOutput += `    ],\n`;
        tsOutput += `    resources: [\n`;
        p.resources.forEach((r, j) => {
            tsOutput += `      {\n`;
            tsOutput += `        title: ${escapeTS(r.title)},\n`;
            tsOutput += `        url: ${escapeTS(r.url)},\n`;
            tsOutput += `        type: ${escapeTS(r.type)},\n`;
            tsOutput += `        provider: ${escapeTS(r.provider)}\n`;
            tsOutput += `      }${j < p.resources.length - 1 ? ',' : ''}\n`;
        });
        tsOutput += `    ],\n`;
        tsOutput += `    next: ${p.next ? `"${p.next}"` : 'null'},\n`;
        tsOutput += `    prev: ${p.prev ? `"${p.prev}"` : 'null'}\n`;
        tsOutput += `  }${i < slugs.length - 1 ? ',' : ''}\n`;
    });
    tsOutput += `};\n`;

    fs.writeFileSync(outputFile, tsOutput, 'utf8');
}
compile();
