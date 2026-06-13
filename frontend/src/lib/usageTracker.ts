import { api } from '@/lib/api';

export interface AIUsageEntry {
  id: string;
  subject: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  date: string;
}

export async function logAIUsage(entry: Omit<AIUsageEntry, "id" | "date"> & { id?: string, status?: string, source?: string }) {
  try {
    // We send this to the backend API now instead of local storage
    await api.post('/ai-usage', {
      model_name: entry.model,
      subject: entry.subject,
      prompt_tokens: entry.prompt_tokens || 0,
      completion_tokens: entry.completion_tokens || 0,
      total_tokens: entry.total_tokens || 0,
      status: entry.status || 'success',
      source: entry.source || 'client',
      error_message: null
    });
  } catch (e) {
    console.error("Failed to log AI usage to backend", e);
    // Optional fallback to local storage if you still want it when offline
  }
}
