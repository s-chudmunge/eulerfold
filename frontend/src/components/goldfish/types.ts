export type GoldfishTab = 'chat' | 'reading' | 'video' | 'calendar';

export type GoldfishAgentState = 'idle' | 'thinking' | 'scouting' | 'happy' | 'success';

export interface ChatMessage {
  id: string;
  sender: 'goldfish' | 'user';
  text: string;
  type?: 'text' | 'resources' | 'video_candidates' | 'schedule' | 'focus';
  data?: any;
  tools_used?: Array<{ tool: string; label: string }>;
  timestamp: string;
}

export interface GoldfishAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: number;
  roadmapSlug?: string;
  roadmapTitle?: string;
  currentModuleIndex: number;
  currentTopicIndex: number;
  currentTopicTitle?: string;
  currentModuleTitle?: string;
  currentVideoTitle?: string;
  currentVideoId?: string;
  initialTab?: GoldfishTab;
  onResourceAdded?: (resources: any[]) => void;
  onVideoReplaced?: (newVideoId: string, newVideoTitle: string, duration?: number) => void;
  onTimerStateChange?: (timer: { isActive: boolean; secondsRemaining: number; durationMins: number }) => void;
}
