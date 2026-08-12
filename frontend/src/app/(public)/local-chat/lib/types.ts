// All shared TypeScript types and interfaces

export interface SearchResult { title: string; url: string; snippet: string; }
export interface FetchResult  { url: string; title: string; content: string; }

export interface ToolActivity {
  callId: string;
  type: 'web_search' | 'fetch_url';
  input: { query?: string; url?: string };
  status: 'running' | 'done' | 'error';
  searchResults?: SearchResult[];
  fetchResult?: FetchResult;
  error?: string;
}

export interface Artifact {
  id: string;
  type: 'html' | 'react' | 'svg';
  title: string;
  code: string;
  messageIndex: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolActivities?: ToolActivity[];
  artifactId?: string;
}

export type ApiMessage =
  | { role: 'system';    content: string }
  | { role: 'user';      content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: any[] }
  | { role: 'tool';      tool_call_id: string; content: string };
