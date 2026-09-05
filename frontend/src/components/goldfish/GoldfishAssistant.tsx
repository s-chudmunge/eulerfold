'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/components/SettingsProvider';
import { TreeIllustration } from '@/components/roadmap/FocusGrove';
import { GoldfishAssistantProps } from './types';
import { GoldfishAvatar, GoldfishIcon } from './GoldfishAvatar';
import { AssistantHeader } from './AssistantHeader';
import { FocusTimerBanner } from './FocusTimerBanner';
import { ChatMessageBubble } from './ChatMessageBubble';
import { QuickChipsBar } from './QuickChipsBar';
import { ConversationalInputBar } from './ConversationalInputBar';
import { useGoldfishAssistant } from './useGoldfishAssistant';

export { GoldfishAvatar, GoldfishIcon };
export type { GoldfishAssistantProps };

const TAB_CONTEXT_PROMPTS: Record<string, string[]> = {
  chat: [
    "Explain this topic simply with an intuitive analogy",
    "How does this connect to previous modules?",
    "Give me 3 practice quiz questions to test myself",
    "Show a practical code example with comments",
    "What are the common pitfalls or mistakes to avoid?"
  ],
  reading: [
    "Find university lecture notes or PDF proofs",
    "I want interactive GitHub examples & repos",
    "Give me concise visual cheat sheets & diagrams",
    "Looking for official documentation & deep dives"
  ],
  video: [
    "Find a university lecture (Stanford/MIT)",
    "I want a quick 10-minute visual derivation",
    "Find a 3Blue1Brown style intuition video",
    "Give me code walkthroughs with live whiteboard"
  ],
  calendar: [
    "Plan a balanced 4-day study schedule this week",
    "I want an intense 6-day study plan with daily quizzes",
    "Set up a casual weekend study schedule"
  ]
};

export default function GoldfishAssistant(props: GoldfishAssistantProps) {
  const {
    isOpen,
    onClose,
    currentModuleIndex,
    currentTopicTitle
  } = props;

  const { openSettings } = useSettings();
  const {
    activeTab,
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
  } = useGoldfishAssistant(props);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-sidebar border border-border rounded-md shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[90vh]"
        >
          {/* Modular Header & Tab Navigation */}
          <AssistantHeader
            agentState={agentState}
            activeTab={activeTab}
            currentTopicTitle={currentTopicTitle}
            currentModuleIndex={currentModuleIndex}
            isTimerActive={isTimerActive}
            onTabChange={handleTabChange}
            onClearChat={handleClearChat}
            onOpenSettings={openSettings}
            onClose={onClose}
          />

          {/* Active Timer Banner when a timer is running */}
          {isTimerActive && (
            <FocusTimerBanner
              isTimerActive={isTimerActive}
              secondsRemaining={secondsRemaining}
              timerDurationMins={timerDurationMins}
              timerProgressPercent={timerProgressPercent}
              currentTimerTreeStage={currentTimerTreeStage}
              tabDistracted={tabDistracted}
              formatTime={formatTime}
              onStartTimer={handleStartTimer}
              onPauseTimer={handlePauseTimer}
              onResetTimer={handleResetTimer}
            />
          )}

          {/* Main Conversational Feed */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-background">
            {messages.map((msg) => (
              <ChatMessageBubble
                key={msg.id}
                msg={msg}
                agentState={agentState}
                currentModuleIndex={currentModuleIndex}
                isGoogleCalendarConnected={isGoogleCalendarConnected}
                approvedMap={approvedMap}
                setApprovedMap={setApprovedMap}
                onOpenSettings={openSettings}
                onCloseModal={onClose}
                isTimerActive={isTimerActive}
                secondsRemaining={secondsRemaining}
                timerDurationMins={timerDurationMins}
                currentTimerTreeStage={currentTimerTreeStage}
                formatTime={formatTime}
                onStartTimer={handleStartTimer}
                onPauseTimer={handlePauseTimer}
              />
            ))}

            {/* Live Progress / Thinking State */}
            {agentState !== 'idle' && (
              <div className="flex items-start gap-3 animate-in fade-in duration-200">
                <GoldfishAvatar state={agentState} size={32} />
                <div className="bg-sidebar border border-orange-500/20 p-3 rounded-md flex items-center gap-2.5 text-[12px] text-text-heading">
                  <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                  <span className="font-medium text-orange-600">{currentStepText || "Working on it..."}</span>
                </div>
              </div>
            )}
          </div>

          {/* Context Quick Chips */}
          <QuickChipsBar
            activeTab={activeTab}
            agentState={agentState}
            tabContextPrompts={TAB_CONTEXT_PROMPTS}
            onSelectChip={(chip) => {
              if (activeTab === 'chat') executeChat(chip);
              else if (activeTab === 'reading') executeScoutReading(chip);
              else if (activeTab === 'video') executeAlternateVideo(chip);
              else if (activeTab === 'calendar') {
                if (chip.includes('intense')) executeGenerateSchedule('intense');
                else if (chip.includes('casual')) executeGenerateSchedule('casual');
                else executeGenerateSchedule('balanced');
              } else {
                if (chip.includes('40')) handleStartTimer(40);
                else if (chip.includes('15')) handleStartTimer(15);
                else if (chip.includes('pause')) handlePauseTimer();
                else if (chip.includes('reset')) handleResetTimer();
                else handleStartTimer(25);
              }
            }}
          />

          {/* User Input Bar */}
          <ConversationalInputBar
            inputText={inputText}
            setInputText={setInputText}
            activeTab={activeTab}
            agentState={agentState}
            onSubmit={handleSendMessage}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
