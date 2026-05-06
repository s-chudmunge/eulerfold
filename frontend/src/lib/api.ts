import axios from 'axios';
import { supabase } from './supabase/client';

// Base API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true
});

// Shared session promise to deduplicate parallel requests
let sessionPromise: Promise<any> | null = null;

export async function getDeduplicatedSession() {
  if (!sessionPromise) {
    sessionPromise = supabase.auth.getSession().finally(() => {
      // Reset after resolution so future calls get a fresh session
      setTimeout(() => { sessionPromise = null; }, 100);
    });
  }
  return sessionPromise;
}

// Request Interceptor to add Auth token automatically
api.interceptors.request.use(
    async (config) => {
        try {
            // Get session with deduplication
            const { data: { session }, error } = await getDeduplicatedSession();

            if (error) {
                console.error("Supabase session error:", error);
            }

            if (session?.access_token && typeof session.access_token === 'string') {
                // Validate token structure: must be a valid JWT with 3 segments separated by dots
                const tokenParts = session.access_token.split('.');
                if (tokenParts.length === 3 && tokenParts.every(part => part.length > 0)) {
                    // Token looks valid - add it to the request
                    if (config.headers.set) {
                        config.headers.set('Authorization', `Bearer ${session.access_token}`);
                    } else {
                        config.headers.Authorization = `Bearer ${session.access_token}`;
                    }
                    console.log(`✅ Added valid token to ${config.url}`);
                } else {
                    // Token is malformed - do NOT send it
                    console.warn('❌ Malformed JWT token detected. Not sending Authorization header.', {
                        tokenSegments: tokenParts.length,
                        tokenPreview: session.access_token.substring(0, 20) + '...',
                        url: config.url
                    });
                    // Remove any existing Authorization header
                    delete config.headers.Authorization;
                }
            } else {
                // Log only in dev to avoid noise, but this explains the 401
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`⚠️ No valid session found for request: ${config.url}`);
                }
                // Remove any existing Authorization header
                delete config.headers.Authorization;
            }
        } catch (error) {
            console.error("Interceptor session retrieval failed:", error);
            // Remove Authorization header on error to avoid sending malformed tokens
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


export const saveRoadmap = async (roadmapSave: any, token?: string): Promise<RoadmapData> => {
    // token is optional as interceptor handles it
    const response = await api.post('/roadmaps/save', roadmapSave);
    return response.data;
};

export interface ProgressUpdate {
    module_number: number;
    topic_index: number;
    completed: boolean;
}

export const roadmapsAPI = {
    getMyRoadmaps: async (): Promise<RoadmapMe[]> => {
        const response = await api.get('/roadmaps/me');
        return response.data;
    },
    getRoadmapById: async (id: number): Promise<RoadmapMe> => {
        const response = await api.get(`/roadmaps/${id}`);
        return response.data;
    },
    getRoadmapBySlug: async (slug: string): Promise<RoadmapMe> => {
        const response = await api.get(`/roadmaps/by-slug/${slug}`);
        return response.data;
    },
    updateProgress: async (id: number, payload: ProgressUpdate): Promise<{ status: string, milestone_reached?: string, coins_earned?: number }> => {
        const response = await api.post(`/roadmaps/${id}/progress`, payload);
        return response.data;
    },
    getProgress: async (id: number): Promise<{ completed_topics: { module_number: number, topic_index: number }[] }> => {
        const response = await api.get(`/roadmaps/${id}/progress`);
        return response.data;
    },
    resetProgress: async (id: number): Promise<{ status: string }> => {
        const response = await api.post(`/roadmaps/${id}/progress/reset`);
        return response.data;
    },
    updateStatus: async (id: number, status: 'active' | 'completed' | 'archived' | 'quit'): Promise<{ status: string, new_status: string }> => {
        const response = await api.patch(`/roadmaps/${id}/status`, { status });
        return response.data;
    },
    deleteRoadmap: async (id: number): Promise<{ status: string, message: string }> => {
        const response = await api.delete(`/roadmaps/${id}`);
        return response.data;
    },
    extendRoadmap: async (id: number, payload: { weeks: number, extension_goal: string }): Promise<RoadmapMe> => {
        const response = await api.post(`/roadmaps/${id}/extend`, payload);
        return response.data;
    },
    deleteRoadmapExtension: async (id: number): Promise<RoadmapMe> => {
        const response = await api.post(`/roadmaps/${id}/delete-extension`);
        return response.data;
    },
    createManualBuild: async (payload: { title: string, goal: string, skills?: string }): Promise<RoadmapRead> => {
        const response = await api.post('/roadmaps/manual-build', payload);
        return response.data;
    },
    generateFromJD: async (payload: { job_description: string, current_experience: string, generation_type: 'incremental' | 'full', time_value: number, time_unit: string }): Promise<RoadmapRead> => {
        const response = await api.post('/roadmaps/generate-from-jd', payload);
        return response.data;
    }
};

export interface User {
    id: number;
    email: string;
    display_name?: string;
    username?: string;
    github_username?: string;
    is_active: boolean;
    is_admin: boolean;
    profile_completed: boolean;
    onboarding_completed: boolean;
    tos_accepted_at?: string;
    tos_version?: string;
    metadata: Record<string, any>;
    unsubscribed: boolean;
    current_streak: number;
    eulercoins: number;
    roadmap_credits: number;
    last_active_date?: string;
    supabase_uid?: string;
    created_at?: string;
}

export const authAPI = {
    getMe: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    acceptTOS: async (version: string): Promise<User> => {
        const response = await api.post('/auth/accept-tos', { version });
        return response.data;
    },
    updateMetadata: async (metadata: Record<string, any>): Promise<any> => {
        const response = await api.post('/auth/metadata', metadata);
        return response.data;
    },
    getOnboardingStatus: async (): Promise<{ needs_onboarding: boolean, profile_completed: boolean, user_id: number }> => {
        const response = await api.get('/auth/onboarding-status');
        return response.data;
    },
    completeOnboarding: async (data: { username: string; display_name?: string }): Promise<User> => {
        const response = await api.post('/auth/complete-onboarding', data);
        return response.data;
    },
    updateProfile: async (data: { display_name?: string, username?: string }): Promise<User> => {
        const response = await api.patch('/auth/profile', data);
        return response.data;
    },
    submitFeatureRequest: async (data: { title: string, description: string }): Promise<any> => {
        const response = await api.post('/auth/feature-request', data);
        return response.data;
    }
};

// Response Interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Log errors for debugging but don't interfere with error handling
        if (error.response?.status === 401) {
            console.warn('401 Unauthorized detected for:', error.config?.url);
            // We NO LONGER call signOut() here. 
            // Let the calling component handle the error or wait for a session refresh.
        } else if (error.response?.status === 404 && !error.config?.url?.includes('/sessions/resume/')) {
            console.log('API Resource not found:', error.config?.url);
        } else if (error.response?.status >= 500) {
            console.error('API Server error:', error.response?.status, error.config?.url);
        }

        return Promise.reject(error);
    }
);

// Learning API functions with behavioral tracking
export const learningAPI = {
    // Track time spent learning
    trackTime: async (subtopicId: string, timeSpentMinutes: number) => {
        const response = await api.post('/track-time', {
            subtopic_id: subtopicId,
            time_spent_minutes: timeSpentMinutes
        });
        return response.data;
    },

    // Mark learning as complete
    completeSubtopic: async (subtopicId: string, timeSpentMinutes?: number) => {
        const response = await api.post('/complete-learning', {
            subtopic_id: subtopicId,
            time_spent_minutes: timeSpentMinutes || 0
        });
        return response.data;
    }
};

// Submissions API
export const submissionsAPI = {
  createSubmission: async (payload: any, token?: string) => {
    const opts: any = {};
    if (token) opts.headers = { Authorization: `Bearer ${token}` };
    const response = await api.post('/submissions', payload, opts);
    return response.data;
  },
  submitFollowupAnswer: async (submissionId: number, answer: string, token?: string) => {
    const opts: any = {};
    if (token) opts.headers = { Authorization: `Bearer ${token}` };
    const response = await api.post(`/submissions/${submissionId}/answer`, { answer }, opts);
    return response.data;
  },
  requestReEvaluation: async (submissionId: number, disputeContext: string, token?: string) => {
    const opts: any = {};
    if (token) opts.headers = { Authorization: `Bearer ${token}` };
    const response = await api.post(`/submissions/${submissionId}/re-evaluate`, { dispute_context: disputeContext }, opts);
    return response.data;
  },
  listSubmissions: async (roadmapId: number, token?: string): Promise<SubmissionsResponse> => {
    try {
        const opts: any = {};
        if (token) opts.headers = { Authorization: `Bearer ${token}` };
        const response = await api.get(`/submissions?roadmap_id=${roadmapId}`, opts);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 403) {
            return { status: "forbidden", submissions: [] };
        }
        throw error;
    }
  },
  getModuleProgress: async (roadmapId: number) => {
    const response = await api.get(`/module_progress?roadmap_id=${roadmapId}`);
    return response.data;
  }
};

export type SubmissionsResponse = {
  status: string;
  submissions: any[];
};

export interface RecommendedReview {
    sub_topic_id: string;
    sub_topic_title: string;
    module_title: string;
    topic_title: string;
    subject: string;
    next_review_date: string; // Date string from backend
}

export interface Topic {
    title: string;
    sub_topics: string[];
}

export interface DayViewSubtopic {
    moduleTitle: string;
    topicTitle: string;
    subTopicTitle: string;
}

export interface RoadmapItem {
    title: string;
    timeline: string;
    topics: Topic[];
}

export interface RoadmapData {
    id: number; // Added roadmap ID
    title: string;
    description: string;
    roadmap_plan: any; // Can be detailed RoadmapItem[] or raw JSON
    subject?: string;
    goal?: string;
    time_value?: number;
    time_unit?: string;
    model?: string;
    last_position?: { mIdx: number; tIdx: number };
    is_public?: boolean;
    show_author?: boolean;
    updated_at: string;
    clone_count?: number;
    average_rating?: number;
    rating_count?: number;
    cloned_id?: number;
    cloned_from?: number;
    is_cloned?: boolean;
    extension_count: number;
}

export interface RoadmapMe extends RoadmapData {
    progress?: {
        percent: number;
        completed_topics: number;
        total_topics: number;
        completed_submissions: number;
        total_submissions: number;
        completed_resources: number;
        total_resources: number;
        bottleneck_module?: number;
    };
    status?: 'active' | 'completed' | 'action_required' | 'archived' | 'quit' | 'needs_improvement' | 'resubmit_required';
    user_rating?: number | null;
}

export interface ExploreRoadmap {
    id: number;
    title: string;
    slug: string;
    username?: string;
    subject: string | null;
    goal: string | null;
    time_value: number | null;
    time_unit: string | null;
    clone_count: number;
    average_rating: number;
    rating_count: number;
    author: string;
    week_count: number;
    topic_count: number;
    created_at: string;
    is_owner: boolean;
    is_cloned: boolean;
}

export const exploreAPI = {
    getExploreRoadmaps: async (search?: string, page: number = 0, limit: number = 20, sort_by: string = "newest"): Promise<ExploreRoadmap[]> => {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        query.append('page', page.toString());
        query.append('limit', limit.toString());
        query.append('sort_by', sort_by);
        
        const response = await api.get(`/explore?${query.toString()}`);
        return response.data;
    },
    cloneRoadmap: async (id: number, token: string): Promise<{ status: string, new_id: number }> => {
        const response = await api.post(`/roadmaps/${id}/clone`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    reportRoadmap: async (id: number, reason: string, token: string): Promise<{ status: string }> => {
        const response = await api.post(`/roadmaps/${id}/report`, { reason }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    updateVisibility: async (id: number, payload: { is_public: boolean, show_author: boolean }, token: string): Promise<{ status: string }> => {
        const response = await api.patch(`/roadmaps/${id}/visibility`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getPublicRoadmap: async (id: number): Promise<any> => {
        const response = await api.get(`/explore/${id}`);
        return response.data;
    },
    rateRoadmap: async (id: number, rating: number, token: string): Promise<{ status: string }> => {
        const response = await api.post(`/roadmaps/${id}/rate`, { rating }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export interface EulerCoinTransaction {
    amount: number;
    reason: string;
    created_at: string;
}

export interface EulerCoinBalance {
    balance: number;
    transactions: EulerCoinTransaction[];
}

export interface LeaderboardEntry {
    author: string;
    username: string;
    composite_score: number;
    top_skill: string | null;
    top_skill_score: number;
    roadmaps_completed: number;
    eulercoins: number;
    current_streak: number;
    roadmaps_shared: number;
    rank: number;
    is_me: boolean;
}

export interface LeaderboardResponse {
    top_users: LeaderboardEntry[];
    user_rank: LeaderboardEntry | null;
}

export const coinsAPI = {
    getBalance: async (token: string): Promise<EulerCoinBalance> => {
        // Validate token exists and looks like a valid JWT (has multiple segments)
        if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
            throw new Error('Invalid or missing auth token');
        }
        const response = await api.get('/coins/balance', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getLeaderboard: async (category?: string): Promise<LeaderboardResponse> => {
        const query = category ? `?category=${category}` : '';
        const response = await api.get(`/coins/leaderboard${query}`);
        return response.data;
    }
};

export interface UserSessionRead {
    id: string; // UUID
    user_id: number;
    roadmap_id: number;
    current_section_id?: string;
    current_topic_id?: string;
    current_subtopic_id?: string;
    last_active_timestamp: string; // ISO string
    session_duration: number;
    scroll_position: number;
    view_mode: string;
    current_index: number;
    completion_percentage: number;
    context_data?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface LearningContentResponse {
    id?: number;
    content: any[];
    model: string;
    subject?: string;
    goal?: string;
    subtopic?: string;
    subtopic_id?: string;
    roadmap_id?: number;

    // Enhanced fields for save/share functionality
    is_saved: boolean;
    is_generated: boolean;
    is_public: boolean;
    share_token?: string;
    created_at?: string;
    updated_at?: string;
}

export interface NextSubtopicResponse {
    module_title: string;
    topic_title: string;
    subtopic_title: string;
    subtopic_id: string;
    status: string;
}

// Query function for fetching recommended reviews
export const fetchRecommendedReviews = async (): Promise<RecommendedReview[]> => {
    const response = await api.get('/reviews/recommended-for-review');
    return response.data;
};

// Query function for fetching user roadmap
export const fetchUserRoadmap = async (): Promise<RoadmapData[]> => {
    const response = await api.get('/roadmaps/');
    return response.data;
};

// Enhanced learning content API functions
export const saveLearningContent = async (contentId: number) => {
  return api.post(`/${contentId}/save`);
};

export const saveNewLearningContent = async (contentData: LearningContentResponse) => {
  return api.post('/save', contentData);
};

export const unsaveLearningContent = async (contentId: number) => {
  return api.delete(`/${contentId}/save`);
};

export const createShareLink = async (contentId: number) => {
  return api.post(`/${contentId}/share`);
};

// New functions for saved learn pages
export const getSavedLearnPage = async (subtopicId: string, roadmapId: number): Promise<LearningContentResponse | null> => {
  try {
    const response = await api.get(`/ml/learn/saved?subtopic_id=${subtopicId}&roadmap_id=${roadmapId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No saved content found
    }
    throw error;
  }
};

export const saveGeneratedLearnPage = async (contentData: LearningContentResponse): Promise<LearningContentResponse> => {
  const response = await api.post('/ml/learn/save', {
    ...contentData,
    is_generated: true,
    is_saved: true
  });
  return response.data;
};

export const getUserSavedLearnPages = async (roadmapId?: number) => {
  const endpoint = roadmapId
    ? `/ml/learn/saved/user?roadmap_id=${roadmapId}`
    : '/ml/learn/saved/user';
  const response = await api.get(endpoint);
  return response.data;
};

export const removeShareLink = async (contentId: number) => {
  return api.delete(`/${contentId}/share`);
};

export const getSharedContent = async (shareToken: string) => {
  return api.get(`/shared/learn/${shareToken}`);
};

export const getSavedLearningContent = async () => {
  return api.get('/saved');
};

// Get next subtopic in roadmap sequence
export const getNextSubtopic = async (roadmapId: number, currentSubtopicId: string): Promise<NextSubtopicResponse | null> => {
  try {
    const response = await api.get(`/roadmaps/${roadmapId}`);
    const roadmap = response.data;

    if (!roadmap?.roadmap_plan) return null;

    let foundCurrent = false;

    // Iterate through roadmap to find current subtopic and return the next one
    for (const module of roadmap.roadmap_plan) {
      if (!module.topics) continue;

      for (const topic of module.topics) {
        if (!topic.subtopics) continue;

        for (const subtopic of topic.subtopics) {
          if (foundCurrent) {
            // Return the next subtopic after finding current
            return {
              module_title: module.title,
              topic_title: topic.title,
              subtopic_title: subtopic.title,
              subtopic_id: subtopic.id,
              status: 'available'
            };
          }

          if (subtopic.id === currentSubtopicId) {
            foundCurrent = true;
          }
        }
      }
    }

    return null; // No next subtopic found
  } catch (error) {
    console.error('Error getting next subtopic:', error);
    return null;
  }
};

// --- Practice APIs ---

export interface PracticeResource {
    id: string;
    title: string;
    url: string;
    platform: string;
    difficulty?: string;
    note: string;
}

export interface PracticeSession {
    id: string;
    user_id: string;
    roadmap_id: number;
    subtopic_id: string;
    resources: PracticeResource[];
    has_more: boolean;
    generation_count: number;
    created_at: string;
    updated_at: string;
}

export interface PracticeProgress {
    session_id: string;
    resource_id: string;
    completed: boolean;
    updated_at: string;
}

export interface MCQQuestion {
    id: string;
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation: string;
}

export interface MCQSessionRead {
    id: string;
    user_id: string;
    roadmap_id: number;
    subtopic_id: string;
    topic_name: string;
    subject: string;
    week_number: number;
    questions: MCQQuestion[];
    user_answers?: number[];
    score?: number;
    credit_cost: number;
    status: 'active' | 'completed' | 'abandoned';
    created_at: string;
    updated_at: string;
}

export const practiceAPI = {
    getOrCreateSession: async (payload: { roadmap_id: number, subtopic_id: string, topic_name: string, subject: string, goal: string }): Promise<PracticeSession> => {
        const response = await api.post('/practice/session', payload);
        return response.data;
    },
    loadMore: async (sessionId: string, payload: { roadmap_id: number, subtopic_id: string, topic_name: string, subject: string, goal: string }): Promise<PracticeSession> => {
        const response = await api.post(`/practice/session/${sessionId}/more`, payload);
        return response.data;
    },
    retrySession: async (sessionId: string, payload: { roadmap_id: number, subtopic_id: string, topic_name: string, subject: string, goal: string }): Promise<PracticeSession> => {
        const response = await api.post(`/practice/session/${sessionId}/retry`, payload);
        return response.data;
    },
    updateProgress: async (sessionId: string, resourceId: string, completed: boolean): Promise<PracticeProgress> => {
        const response = await api.patch(`/practice/session/${sessionId}/progress`, { resource_id: resourceId, completed });
        return response.data;
    },
    getSessionProgress: async (sessionId: string): Promise<PracticeProgress[]> => {
        const response = await api.get(`/practice/session/${sessionId}/progress`);
        return response.data;
    },
    generateMCQSession: async (payload: { roadmap_id: number, subtopic_id: string, topic_name: string, subject: string, week_number: number, num_questions: number }): Promise<MCQSessionRead> => {
        const response = await api.post('/practice/mcq/generate', payload);
        return response.data;
    },
    getIncompleteMCQSession: async (subtopicId: string): Promise<MCQSessionRead | null> => {
        try {
            const response = await api.get(`/practice/mcq/incomplete/${subtopicId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },
    abandonMCQSession: async (sessionId: string): Promise<{ status: string }> => {
        const response = await api.post(`/practice/mcq/${sessionId}/abandon`);
        return response.data;
    },
    getMCQHistory: async (subtopicId: string): Promise<MCQSessionRead[]> => {
        const response = await api.get(`/practice/mcq/history/${subtopicId}`);
        return response.data;
    },
    getMCQSession: async (sessionId: string): Promise<MCQSessionRead> => {
        const response = await api.get(`/practice/mcq/session/${sessionId}`);
        return response.data;
    },
    submitMCQSession: async (sessionId: string, answers: number[]): Promise<MCQSessionRead> => {
        const response = await api.post(`/practice/mcq/${sessionId}/submit`, { answers });
        return response.data;
    }
};

// --- Profile APIs ---

export interface UserSkill {
    id: string;
    canonical_skill_id: string;
    name?: string;
    category?: string;
    confidence_score: number;
    tier: 'strong' | 'developing' | 'exposure';
    pow_score: number;
    practice_score: number;
    topic_completion: number;
    depth_score: number;
    time_invested: number;
    last_updated: string;
}

export interface PublicProfile {
    username: string;
    display_name?: string;
    github_username?: string;
    email?: string;
    avatar_url?: string;
    supabase_uid?: string;
    eulercoins: number;
    audit_precision: number;
    learning_momentum: {
        mastered: number;
        explored: number;
    };
    total_skills: number;
    total_roadmaps: number;
    total_hours: number;
    last_active?: string;
    skills: UserSkill[];
    submissions?: any[];
    mcq_history?: MCQSessionRead[];
    discussions?: any[];
    practice_stats?: {
        easy: number;
        medium: number;
        hard: number;
        total: number;
        mcq_correct: number;
        mcq_total: number;
    };
}
export const profileAPI = {
    getPublicProfile: async (username: string): Promise<PublicProfile> => {
        const response = await api.get(`/profile/${username}`);
        return response.data;
    },
    updateAvatar: async (avatarUrl: string): Promise<{ status: string, avatar_url: string }> => {
        const response = await api.patch(`/profile/avatar?avatar_url=${encodeURIComponent(avatarUrl)}`);
        return response.data;
    },
    getActivity: async (username: string): Promise<Record<string, number>> => {
        const response = await api.get(`/profile/${username}/activity`);
        return response.data;
    },
    getSkillDetail: async (username: string, skillId: string): Promise<any> => {
        const response = await api.get(`/profile/${username}/skills/${skillId}`);
        return response.data;
    },
    deleteProfile: async (): Promise<{ status: string, message: string }> => {
        const response = await api.delete('/profile/me');
        return response.data;
    }
};

export const assessmentsAPI = {
    start: async (skillId: string) => {
        const response = await api.post('/assessments/start', null, { params: { skill_id: skillId } });
        return response.data;
    },
    flag: async (sessionId: string) => {
        const response = await api.post(`/assessments/${sessionId}/flag`);
        return response.data;
    },
    submit: async (sessionId: string, answers: any[]) => {
        const response = await api.post(`/assessments/${sessionId}/submit`, answers);
        return response.data;
    },
    getSession: async (sessionId: string) => {
        const response = await api.get(`/assessments/${sessionId}`);
        return response.data;
    }
};

export const paymentsAPI = {
    getTransactions: async (): Promise<any[]> => {
        const response = await api.get('/payments/transactions');
        return response.data;
    }
};

export const sessionsAPI = {
    logSession: (durationSeconds: number, token?: string) => {
        if (typeof window === 'undefined') return;
        
        // Ensure we have a protocol. If BACKEND_URL is just "localhost:8001", fetch will fail.
        const base = BACKEND_URL.startsWith('http') ? BACKEND_URL : `http://${BACKEND_URL}`;
        const url = `${base}/sessions/log`;
        const body = JSON.stringify({ duration_seconds: durationSeconds });
        
        if (!token) {
            // If no token provided, try to get it from Supabase cache (sync-ish)
            // but if we are in a visibilitychange hidden event, this might be too late.
            // Best to have the token passed in.
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.access_token) {
                    sessionsAPI.performLog(url, body, session.access_token);
                }
            });
        } else {
            sessionsAPI.performLog(url, body, token);
        }
    },
    performLog: (url: string, body: string, token: string) => {
        try {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                    },
                body,
                keepalive: true
            }).catch(err => console.error("Session log fetch error:", err));
        } catch (err) {
            console.error("Failed to initiate session log:", err);
        }
    },
    getTotalTime: async (): Promise<{ total_seconds: number, active_days: number }> => {
        const response = await api.get('/sessions/total');
        return response.data;
    },
    getWeeklyStats: async (): Promise<{ duration_seconds: number, created_at: string }[]> => {
        const response = await api.get('/sessions/weekly-stats');
        return response.data;
    },
    getSessionsRange: async (start: string, end: string): Promise<{ duration_seconds: number, created_at: string }[]> => {
        const response = await api.get('/sessions/range', { params: { start_date: start, end_date: end } });
        return response.data;
    }
};

export const plannerAPI = {
    getTasks: async (start?: string, end?: string): Promise<any[]> => {
        const response = await api.get('/planner/tasks', { params: { start_date: start, end_date: end } });
        return response.data;
    },
    createTask: async (data: any): Promise<any> => {
        const response = await api.post('/planner/tasks', data);
        return response.data;
    },
    updateTask: async (id: string, data: any): Promise<any> => {
        const response = await api.patch(`/planner/tasks/${id}`, data);
        return response.data;
    },
    deleteTask: async (id: string): Promise<any> => {
        const response = await api.delete(`/planner/tasks/${id}`);
        return response.data;
    },
    deleteTasksRange: async (start: string, end: string): Promise<any> => {
        const response = await api.delete('/planner/tasks-range', { params: { start_date: start, end_date: end } });
        return response.data;
    },
    generatePlan: async (data: { roadmap_ids: number[], start_date: string, target_date: string, intensity: string }): Promise<any> => {
        const response = await api.post('/planner/generate', data);
        return response.data;
    }
};
