export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
export const MAX_TOOL_CALLS = 3;
export const IDLE_MS = 15 * 60 * 1000;
// WebLLM explicitly only allows the 'tools' parameter for specific models.
// If WebLLM updates this list in the future, it must be added here.
const FC_SUPPORTED_MODELS = new Set([
  'hermes-2-pro-llama-3-8b-q4f16_1-mlc',
  'hermes-2-pro-llama-3-8b-q4f32_1-mlc',
  'hermes-2-pro-mistral-7b-q4f16_1-mlc',
  'hermes-3-llama-3.1-8b-q4f32_1-mlc',
  'hermes-3-llama-3.1-8b-q4f16_1-mlc'
]);

export function modelSupportsFunctionCalling(modelId: string): boolean {
  return FC_SUPPORTED_MODELS.has(modelId.toLowerCase());
}

export const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web for current info, documentation, tutorials, or recent events.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string', description: 'Search query' } },
        required: ['query']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'fetch_url',
      description: 'Fetch and read the text content of a specific URL (docs, papers, GitHub repos, blog posts).',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string', description: 'Full URL to fetch' } },
        required: ['url']
      }
    }
  }
];

export const STARTER_PROMPTS = [
  { label: 'Build a UI', prompt: 'Build a react calculator app with a clean design. Use useState for the logic.' },
  { label: 'Search & explain', prompt: 'Search for the latest open-source LLM benchmarks and summarize the key findings.' },
  { label: 'Read a URL', prompt: 'Fetch and summarize: https://huggingface.co/docs/transformers/index' },
  { label: 'Make a diagram', prompt: 'Build an SVG diagram showing how transformer attention works, with labeled blocks and arrows.' },
];
