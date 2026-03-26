export type ContentBlock = 
  | { type: 'heading'; data: { level: 1 | 2 | 3; text: string } }
  | { type: 'paragraph'; data: { text: string } }
  | { type: 'progressive_disclosure'; data: { key_idea: string; summary: string; full_text: string; visual_url?: string } }
  | { type: 'active_recall'; data: { question: string; answer: string } }
  | { type: 'dual_coding'; data: { text: string; visual_url: string; position: 'left' | 'right' } }
  | { type: 'comparison_table'; data: { headers: string[]; rows: string[][] } }
  | { type: 'callout'; data: { text: string; style: 'metaphor' | 'analogy' | 'example' | 'warning' } }
  | { type: 'mermaid_diagram'; data: { chart: string } }
  | { type: '3d_visualization'; data: { description: string } };

export type LearningContent = ContentBlock[];
