'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { goldfishAPI } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { dispatchTreeHarvest } from '@/components/grove/harvestUtils';
import { GoldfishAssistantProps, ChatMessage, GoldfishTab, GoldfishAgentState } from './types';

export function useGoldfishAssistant({
  isOpen,
  roadmapId,
  roadmapTitle,
  currentModuleIndex,
  currentTopicIndex,
  currentTopicTitle,
  currentModuleTitle,
  currentVideoTitle,
  initialTab = 'chat',
  onResourceAdded,
  onVideoReplaced,
  onTimerStateChange
}: GoldfishAssistantProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<GoldfishTab>(initialTab || 'chat');
  const [statusData, setStatusData] = useState<any>(null);
  const [agentState, setAgentState] = useState<GoldfishAgentState>('idle');
  const [currentStepText, setCurrentStepText] = useState<string>('');
  
  // Dynamic integration state
  const isGoogleCalendarConnected = Boolean(
    (user as any)?.raw_user_meta_data?.connections?.google_calendar_connected ||
    (user as any)?.connections?.google_calendar_connected ||
    (typeof window !== 'undefined' && localStorage.getItem('conn_google_calendar') === 'true')
  );
  
  // Conversational chat feed
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Focus Pomodoro Timer State
  const [timerDurationMins, setTimerDurationMins] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [tabDistracted, setTabDistracted] = useState(false);
  const [approvedMap, setApprovedMap] = useState<Record<string, string>>({});

  // Notify parent of timer changes
  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange({
        isActive: isTimerActive,
        secondsRemaining,
        durationMins: timerDurationMins
      });
    }
  }, [isTimerActive, secondsRemaining, timerDurationMins, onTimerStateChange]);

  const storageKey = `eulerfold_grove_${roadmapId}`;
  const chatStorageKey = `eulerfold_goldfish_chat_${roadmapId}`;

  // Tab switch detection (Distraction penalty warning)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTimerActive) {
        setTabDistracted(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerActive]);

  // Pomodoro Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (isTimerActive && secondsRemaining === 0) {
      setIsTimerActive(false);
      setAgentState('happy');
      
      try {
        const saved = localStorage.getItem(storageKey);
        const current = saved ? JSON.parse(saved) : { totalMinutes: 0, plantedTrees: 0 };
        const updated = {
          totalMinutes: current.totalMinutes + timerDurationMins,
          plantedTrees: current.plantedTrees + 1
        };
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}

      // Dispatch global tree harvest event so modal, stats, and notification bell trigger everywhere
      try {
        dispatchTreeHarvest({
          type: 'focus_session',
          title: `${timerDurationMins}m Deep Focus Session`,
          treesEarned: 1,
          coinsEarned: 5,
          roadmapId: roadmapId,
          durationMins: timerDurationMins
        });
      } catch (e) {
        console.error('Failed to dispatch tree harvest from Goldfish timer:', e);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `timer-done-${Date.now()}`,
          sender: 'goldfish',
          text: `🎉 **Pomodoro session complete!** Your ${timerDurationMins}-minute focus tree has fully grown and been planted in your Study Grove.`,
          type: 'focus',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, secondsRemaining, timerDurationMins, storageKey]);

  const timerProgressPercent = useMemo(() => {
    const totalSecs = timerDurationMins * 60;
    return Math.min(100, Math.round(((totalSecs - secondsRemaining) / totalSecs) * 100));
  }, [timerDurationMins, secondsRemaining]);

  const currentTimerTreeStage = useMemo(() => {
    if (timerProgressPercent >= 100) return 'blooming';
    if (timerProgressPercent >= 75) return 'mature';
    if (timerProgressPercent >= 40) return 'sapling';
    if (timerProgressPercent >= 10) return 'sprout';
    return 'seed';
  }, [timerProgressPercent]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Initialize conversation from localStorage or default greeting
  useEffect(() => {
    if (isOpen) {
      goldfishAPI.getStatus()
        .then(res => setStatusData(res))
        .catch(err => console.error('Failed to fetch Goldfish status:', err));

      try {
        const saved = localStorage.getItem(chatStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch {}

      if (messages.length === 0) {
        const welcomeText = `Ready to help you master **${currentTopicTitle || 'this topic'}**. Find good reading material, find lectures, plan your schedule, run focus sessions, or simply ask me anything.`;
        setMessages([{
          id: 'welcome',
          sender: 'goldfish',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }
  }, [isOpen, roadmapId]);

  // Persist messages to localStorage whenever updated
  useEffect(() => {
    if (messages.length > 0 && roadmapId) {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(messages.slice(-50)));
      } catch {}
    }
  }, [messages, chatStorageKey, roadmapId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, agentState, currentStepText]);

  const handleTabChange = (newTab: GoldfishTab) => {
    setActiveTab(newTab);
    let promptMsg = "";
    if (newTab === 'chat') {
      promptMsg = `I'm here to assist you with **${currentTopicTitle || 'this topic'}**! Ask any question, request analogies, math derivations, code examples, or study advice.`;
    } else if (newTab === 'reading') {
      promptMsg = `I'm ready to scout reading materials for **"${currentTopicTitle || currentModuleTitle || 'Current Topic'}"**. Tell me what depth or format you prefer.`;
    } else if (newTab === 'video') {
      promptMsg = `Currently watching "${currentVideoTitle || currentTopicTitle || 'this lecture'}". Tell me what teaching style you want and I'll find a verified replacement.`;
    } else if (newTab === 'calendar') {
      promptMsg = `Let's sync your week schedule! I can distribute the topics for Module ${currentModuleIndex + 1} across your week and export to Google Calendar.`;
    } else if (newTab === 'focus') {
      promptMsg = `Ready to study? You can start a Pomodoro timer here or tell me in chat (e.g., *"Start timer for 40 mins"*). Your tree will grow as you stay focused.`;
    }

    setMessages(prev => [
      ...prev,
      {
        id: `tab-switch-${Date.now()}`,
        sender: 'goldfish',
        text: promptMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const executeChat = async (question: string) => {
    setAgentState('thinking');
    setCurrentStepText("Analyzing roadmap context and generating explanation...");

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const history = messages
        .filter(m => m.type !== 'resources' && m.type !== 'video_candidates' && m.type !== 'schedule' && m.type !== 'focus')
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      const res = await goldfishAPI.chat({
        roadmap_id: roadmapId,
        module_index: currentModuleIndex,
        topic_index: currentTopicIndex,
        message: question,
        chat_history: history
      });

      setAgentState('happy');
      setCurrentStepText("Answer ready!");

      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-${Date.now()}`,
          sender: 'goldfish',
          text: res.reply,
          type: 'text',
          tools_used: res.tools_used || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      goldfishAPI.getStatus().then(setStatusData);
    } catch (err: any) {
      setAgentState('idle');
      setCurrentStepText('');
      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-err-${Date.now()}`,
          sender: 'goldfish',
          text: err.response?.data?.detail || "I encountered an error answering your question. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTimeout(() => {
        setAgentState('idle');
        setCurrentStepText('');
      }, 3000);
    }
  };

  const executeScoutReading = async (promptQuery: string, action: 'add' | 'replace' = 'add') => {
    setAgentState('thinking');
    setCurrentStepText("Analyzing topic learning objectives with Google Gemini...");

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: promptQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      setTimeout(() => {
        setAgentState('scouting');
        setCurrentStepText("Searching technical documents, universities, and official docs...");
      }, 1000);

      const res = await goldfishAPI.scoutReading({
        roadmap_id: roadmapId,
        module_index: currentModuleIndex,
        topic_index: currentTopicIndex,
        prompt: promptQuery,
        action
      });

      setAgentState('happy');
      setCurrentStepText("Done!");

      const added = res.added_resources || [];
      if (onResourceAdded) {
        onResourceAdded(res.total_module_resources);
      }

      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-${Date.now()}`,
          sender: 'goldfish',
          text: `Found and added **${added.length} curated resources** directly to your module!`,
          type: 'resources',
          data: added,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      goldfishAPI.getStatus().then(setStatusData);
    } catch (err: any) {
      setAgentState('idle');
      setCurrentStepText('');
      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-err-${Date.now()}`,
          sender: 'goldfish',
          text: `Sorry, I hit a snag searching: ${err.response?.data?.detail || 'Please try a different search phrase.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTimeout(() => {
        setAgentState('idle');
        setCurrentStepText('');
      }, 3000);
    }
  };

  const executeAlternateVideo = async (promptQuery: string) => {
    setAgentState('thinking');
    setCurrentStepText("Understanding video preferences & querying verified channels...");

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: promptQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      setTimeout(() => {
        setAgentState('scouting');
        setCurrentStepText("Filtering lectures & checking educational trust scores...");
      }, 1000);

      const res = await goldfishAPI.findAlternateVideo({
        roadmap_id: roadmapId,
        module_index: currentModuleIndex,
        topic_index: currentTopicIndex,
        prompt: promptQuery,
        action: 'replace'
      });

      setAgentState('happy');
      setCurrentStepText("Found verified lecture!");

      if (res.selected_video && onVideoReplaced) {
        onVideoReplaced(
          res.selected_video.video_id,
          res.selected_video.video_title,
          res.selected_video.duration_minutes
        );
      }

      const channelName = res.selected_video?.channel_name || res.selected_video?.channel_title || "Verified Educator";
      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-${Date.now()}`,
          sender: 'goldfish',
          text: `Replaced the lecture with **${res.selected_video?.video_title}** (${channelName}). It is now active on your player!`,
          type: 'video_candidates',
          data: res.all_candidates || [res.selected_video],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      goldfishAPI.getStatus().then(setStatusData);
    } catch (err: any) {
      setAgentState('idle');
      setCurrentStepText('');
      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-err-${Date.now()}`,
          sender: 'goldfish',
          text: `Could not find an alternative video matching that criteria. ${err.response?.data?.detail || ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTimeout(() => {
        setAgentState('idle');
        setCurrentStepText('');
      }, 3000);
    }
  };

  const executeGenerateSchedule = async (intensity: 'casual' | 'balanced' | 'intense' = 'balanced', customNotes?: string) => {
    setAgentState('thinking');
    setCurrentStepText(`Computing personalized study pacing for Week ${currentModuleIndex + 1}...`);

    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: customNotes || `Create a ${intensity} study schedule for this week.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      setTimeout(() => {
        setAgentState('scouting');
        setCurrentStepText("Analyzing topic prerequisites & building calendar sync...");
      }, 1000);

      const res = await goldfishAPI.generateSchedule({
        roadmap_id: roadmapId,
        week_number: currentModuleIndex + 1,
        intensity,
        custom_notes: customNotes
      });

      setAgentState('happy');
      setCurrentStepText("Schedule generated!");

      const taskCount = res.tasks_count ?? res.tasks_created_count ?? (res.schedule?.length || 0);
      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-${Date.now()}`,
          sender: 'goldfish',
          text: `Your ${intensity} schedule is ready! I've added **${taskCount} study sessions** to your study planner. You can add each event directly to Google Calendar or connect your calendar for automatic sync:`,
          type: 'schedule',
          data: {
            schedule: res.schedule || [],
            intensity,
            strategyNote: res.strategy_note
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      goldfishAPI.getStatus().then(setStatusData);
    } catch (err: any) {
      setAgentState('idle');
      setCurrentStepText('');
      setMessages(prev => [
        ...prev,
        {
          id: `goldfish-err-${Date.now()}`,
          sender: 'goldfish',
          text: `Failed to create schedule: ${err.response?.data?.detail || 'Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setTimeout(() => {
        setAgentState('idle');
        setCurrentStepText('');
      }, 3000);
    }
  };

  const handleStartTimer = (mins: number) => {
    setTimerDurationMins(mins);
    setSecondsRemaining(mins * 60);
    setIsTimerActive(true);
    setTabDistracted(false);
  };

  const handlePauseTimer = () => {
    setIsTimerActive(false);
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    setSecondsRemaining(timerDurationMins * 60);
    setTabDistracted(false);
  };

  const handleClearChat = () => {
    try {
      localStorage.removeItem(chatStorageKey);
    } catch {}

    const welcomeText = `Ready to help you master **${currentTopicTitle || 'this topic'}**. Find good reading material, find lectures, plan your schedule, run focus sessions, or simply ask me anything.`;
    setMessages([{
      id: `welcome-${Date.now()}`,
      sender: 'goldfish',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setApprovedMap({});
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || agentState !== 'idle') return;
    const query = inputText.trim();
    // Tab-based execution
    if (activeTab === 'chat') {
      executeChat(query);
    } else if (activeTab === 'reading') {
      executeScoutReading(query, 'add');
    } else if (activeTab === 'video') {
      executeAlternateVideo(query);
    } else if (activeTab === 'calendar') {
      const lower = query.toLowerCase();
      const intensity = lower.includes('intense') ? 'intense' : lower.includes('casual') ? 'casual' : 'balanced';
      executeGenerateSchedule(intensity, query);
    } else if (activeTab === 'focus') {
      const match = query.match(/\d+/);
      const mins = match ? parseInt(match[0], 10) : 25;
      handleStartTimer(mins);
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: 'user',
          text: query,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: `goldfish-${Date.now()}`,
          sender: 'goldfish',
          text: `🌱 Started your **${mins}-minute focus session**! Your virtual seed is planted and now growing in your Focus Grove. Stay on EulerFold to keep it healthy.`,
          type: 'focus',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      executeChat(query);
    }
  };

  return {
    activeTab,
    setActiveTab,
    agentState,
    currentStepText,
    isGoogleCalendarConnected,
    messages,
    inputText,
    setInputText,
    chatScrollRef,
    timerDurationMins,
    secondsRemaining,
    isTimerActive,
    tabDistracted,
    approvedMap,
    setApprovedMap,
    timerProgressPercent,
    currentTimerTreeStage,
    formatTime,
    handleTabChange,
    handleStartTimer,
    handlePauseTimer,
    handleResetTimer,
    handleClearChat,
    handleSendMessage,
    executeChat,
    executeScoutReading,
    executeAlternateVideo,
    executeGenerateSchedule
  };
}
