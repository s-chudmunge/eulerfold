export type TreeStage = 'seed' | 'sprout' | 'sapling' | 'mature' | 'blooming';

export type TreeVariety = 'pine' | 'oak' | 'spruce' | 'willow' | 'blossom_oak' | 'sapling';

export interface TreeHarvestEvent {
  id: string;
  type: 'focus_session' | 'topic_completed' | 'practice_cleared' | 'homework_approved' | 'module_mastered';
  title: string;
  treesEarned: number;
  coinsEarned: number;
  timestamp: string;
  variety?: TreeVariety;
  roadmapId?: number | string;
  durationMins?: number;
}

export interface ActivityTreeBreakdown {
  focusSessionTrees: number;     // Evergreen Pines (25m sessions)
  topicCompletedTrees: number;   // Broadleaf Oaks (Lessons completed)
  practiceClearedTrees: number;  // Highland Spruces (MCQ quizzes passed)
  homeworkApprovedTrees: number; // Weeping Willows (Proof of Work approved)
  milestoneBlossomTrees: number; // Golden Blossom Oaks (4-session / module milestones)
}

export interface FocusGroveProps {
  roadmapId: number | string;
  roadmapSlug?: string;
  totalTopics: number;
  completedTopicsCount: number;
  modules?: any[];
  onSessionComplete?: (focusMinutes: number) => void;
}

export interface GroveMetrics {
  totalSeconds: number;
  totalMinutes: number;
  plantedTrees: number;
  topicsMastered: number;
  quizzesCleared: number;
  homeworkApproved: number;
}
