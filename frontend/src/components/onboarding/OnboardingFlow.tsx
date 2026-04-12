"use client";

import React, { useState } from 'react';
import { User, authAPI } from '@/lib/api';
import ClaimUsernameStep from './ClaimUsernameStep';
import ObjectiveSelectionStep from './ObjectiveSelectionStep';
import PathDiscoveryStep from './PathDiscoveryStep';

interface OnboardingFlowProps {
  user: any; // Auth user
  onComplete: (updatedUser: User) => void;
  onExit: () => void;
}

export type OnboardingStep = 'profile' | 'objective' | 'path';

export default function OnboardingFlow({ user, onComplete, onExit }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('profile');
  const [profileData, setProfileData] = useState<User | null>(null);

  const handleProfileComplete = (updatedUser: User) => {
    setProfileData(updatedUser);
    setStep('objective');
  };

  const handleObjectiveComplete = async (objective: string, detail?: string) => {
    // Save objective to metadata via API
    try {
      await authAPI.updateMetadata({
        onboarding_objective: objective,
        onboarding_objective_detail: detail,
        onboarding_objective_set_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to save onboarding objective:", err);
    }
    setStep('path');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-6 overflow-y-auto animate-in fade-in duration-500">
      <div className="w-full max-w-[800px] py-12">
        {step === 'profile' ? (
          <ClaimUsernameStep 
            initialEmail={user?.email} 
            onSuccess={handleProfileComplete} 
          />
        ) : step === 'objective' ? (
          <ObjectiveSelectionStep 
            displayName={profileData?.display_name || 'Explorer'}
            onSuccess={handleObjectiveComplete}
          />
        ) : (
          <PathDiscoveryStep 
            displayName={profileData?.display_name || 'Explorer'} 
            onExit={() => {
              if (profileData) onComplete(profileData);
              onExit();
            }} 
          />
        )}
      </div>
    </div>
  );
}
