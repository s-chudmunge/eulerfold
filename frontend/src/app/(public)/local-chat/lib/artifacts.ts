import type { Artifact } from './types';

export function cleanReactCode(code: string): string {
  let clean = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/gi, '');
  clean = clean.replace(/export\s+default\s+[A-Za-z0-9_]+;?/gi, '');
  clean = clean.replace(/export\s+default\s+/gi, '');
  return clean.trim();
}

export function inferTitle(code: string, type: Artifact['type']): string {
  if (type === 'html') {
    const t = code.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) return t[1].trim();
    const h = code.match(/<h[12][^>]*>([^<]*)<\/h[12]>/i);
    if (h) return h[1].replace(/<[^>]+>/g, '').trim() || 'HTML Application';
    return 'HTML Application';
  }
  if (type === 'react') {
    const f = code.match(/(?:function|const)\s+([A-Z][A-Za-z0-9_]*)\s*[=(]/);
    return f ? f[1] : 'React Application';
  }
  if (type === 'svg') return 'SVG Visualization';
  return 'Interactive Artifact';
}

/**
 * Guard: only treat an HTML block as an interactive artifact if it has
 * inline script logic OR interactive form/canvas elements.
 * Plain HTML text wrappers (model wrapping a summary in <html> tags) are excluded.
 */
function isInteractiveHTML(code: string): boolean {
  // Inline <script> with actual JS (not just an external src="..." tag)
  const hasInlineScript = /<script(?![^>]*\bsrc=["'])[^>]*>[\s\S]{10,}<\/script>/i.test(code);
  // Interactive UI elements
  const hasInteractiveEl = /<(button|input|form|canvas|select|textarea|dialog|details)[\s>]/i.test(code);
  return hasInlineScript || hasInteractiveEl;
}

export function detectArtifact(content: string): Omit<Artifact, 'id' | 'messageIndex'> | null {
  const codeBlockRegex = /```(\w*)\r?\n([\s\S]*?)```/gi;
  const blocks: Array<{ lang: string; code: string }> = [];
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({ lang: match[1].toLowerCase(), code: match[2].trim() });
  }
  if (blocks.length === 0) return null;

  for (const b of blocks) {
    const code = b.code;
    const isReactSignature =
      ['react', 'jsx', 'tsx'].includes(b.lang) ||
      code.includes('useState(') ||
      code.includes('useEffect(') ||
      code.includes('import React') ||
      (code.includes('<script>') && (code.includes('useState') || code.includes('export default')));

    if (isReactSignature && code.length > 20) {
      let componentCode = code;
      const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch) componentCode = scriptMatch[1];
      componentCode = cleanReactCode(componentCode);
      return { type: 'react', title: inferTitle(componentCode, 'react'), code: componentCode };
    }
  }

  const htmlBlock = blocks.find(b => ['html', 'xml'].includes(b.lang));
  if (htmlBlock && htmlBlock.code.length > 20) {
    let combinedCode = htmlBlock.code;
    const jsBlock = blocks.find(b => ['js', 'javascript'].includes(b.lang));
    const cssBlock = blocks.find(b => b.lang === 'css');

    if (cssBlock && !combinedCode.includes(cssBlock.code)) {
      combinedCode = combinedCode.replace('</head>', `<style>\n${cssBlock.code}\n</style>\n</head>`);
    }
    if (jsBlock && !combinedCode.includes(jsBlock.code)) {
      combinedCode = combinedCode.replace(/<script\s+src=["'][^"']+["']\s*><\/script>/gi, '');
      combinedCode = combinedCode.replace('</body>', `<script>\n${jsBlock.code}\n</script>\n</body>`);
    }

    // Only open the artifact panel if the HTML is actually interactive.
    // Plain text-summaries wrapped in <html> tags by the model are skipped.
    if (!isInteractiveHTML(combinedCode)) return null;

    return { type: 'html', title: inferTitle(combinedCode, 'html'), code: combinedCode };
  }

  const svgBlock = blocks.find(b => b.lang === 'svg' || b.code.startsWith('<svg'));
  if (svgBlock && svgBlock.code.length > 20) {
    return { type: 'svg', title: inferTitle(svgBlock.code, 'svg'), code: svgBlock.code };
  }

  return null;
}

export function detectRootComponent(code: string): string {
  if (/(?:function\s+App\b|const\s+App\s*=|class\s+App\b)/.test(code)) return 'App';
  const matches = [
    ...code.matchAll(
      /(?:^|\n)\s*(?:export\s+default\s+)?(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)\s*[=({\s]/g
    )
  ];
  if (matches.length > 0) return matches[matches.length - 1][1];
  return 'App';
}

const REACT_CDNS = `<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>`;

const BASE_HEAD = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${REACT_CDNS}
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:16px;background:#0d1117;color:#c9d1d9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh}
  input,button,select,textarea{font-family:inherit}
</style>
</head>`;

export function buildIframeSrc(artifact: Artifact): string {
  if (artifact.type === 'react') {
    const cleanedCode = cleanReactCode(artifact.code);
    const rootName = detectRootComponent(cleanedCode);
    const aliasLine = rootName !== 'App' ? `\nconst App = ${rootName};` : '';
    return `${BASE_HEAD}<body>
<div id="root"></div>
<script type="text/babel">
const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext } = React;
${cleanedCode}${aliasLine}
const rootEl = document.getElementById('root');
const root = ReactDOM.createRoot(rootEl);
root.render(<App />);
</script>
</body></html>`;
  }

  if (artifact.type === 'svg') {
    return `${BASE_HEAD}<body><div style="display:flex;align-items:center;justify-content:center;min-height:100vh">${artifact.code}</div></body></html>`;
  }

  // HTML
  let htmlCode = artifact.code;
  htmlCode = htmlCode.replace(/<script\s+src=["'](?!https?:\/\/)[^"']+["']\s*><\/script>/gi, '');
  if (htmlCode.includes('useState') || htmlCode.includes('import React') || htmlCode.includes('export default')) {
    htmlCode = htmlCode.replace(/<script[^>]*>/gi, '<script type="text/babel">');
    htmlCode = cleanReactCode(htmlCode);
  }
  if (htmlCode.toLowerCase().includes('<!doctype') || htmlCode.toLowerCase().includes('<html')) {
    if ((htmlCode.includes('type="text/babel"') || htmlCode.includes('useState')) && !htmlCode.includes('babel')) {
      htmlCode = htmlCode.replace('</head>', `${REACT_CDNS}\n</head>`);
    }
    return htmlCode;
  }
  return `${BASE_HEAD}<body>${htmlCode}</body></html>`;
}
