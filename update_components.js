const fs = require('fs');
const file = '/home/sankalp/Documents/projects/eulerfold/frontend/src/app/(public)/research-lab/[id]/ResearchLabDetailClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
`;
content = content.replace("import ReactMarkdown from 'react-markdown';", importStatement + "import ReactMarkdown from 'react-markdown';");

// Remove the old CodeBlockWrapper and markdownComponents
content = content.replace(/const CodeBlockWrapper = \(\{ children, \.\.\.props \}: any\) => \{[\s\S]*?const markdownComponents = \{[\s\S]*?    \}\n\};\n/m, '');

// Insert the new ones before ResearchLabDetailClient
const newComponents = `const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button 
            onClick={handleCopy}
            className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
};

const markdownComponents = {
    pre: ({ children }: any) => <>{children}</>,
    code: ({node, inline, className, children, ...props}: any) => {
        const match = /language-(\\w+)/.exec(className || '');
        const isBlock = !inline && match;
        const language = match ? match[1] : 'text';
        
        // If it's a code block but missing a language identifier, or it is a code block
        if (!inline) {
            return (
                <div className="my-8 rounded-xl overflow-hidden border border-border/40 shadow-xl bg-[#1E1E1E] relative group">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#2D2D2D] border-b border-black/30">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                        </div>
                        <CopyButton text={String(children).replace(/\\n$/, '')} />
                    </div>
                    <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={language}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1.25rem', fontSize: '13px', lineHeight: '1.6', background: 'transparent' }}
                    >
                        {String(children).replace(/\\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            );
        }

        return (
            <code className={className || "px-1.5 py-0.5 mx-0.5 rounded bg-blue-600/10 border border-blue-600/20 text-blue-500 font-mono text-[0.85em]"} {...props}>
                {children}
            </code>
        );
    }
};
`;

content = content.replace(/interface Message \{ role: 'user' \| 'assistant'; content: string; \}/, newComponents + '\ninterface Message { role: \'user\' | \'assistant\'; content: string; }');

fs.writeFileSync(file, content);
console.log("Updated components!");
