// @ts-nocheck
import React from 'react';

interface SubjectAndGoalStepProps {
  formData: {
    subject: string;
    goal: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const SubjectAndGoalStep: React.FC<SubjectAndGoalStepProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-8 manrope-body">
      <div>
        <label htmlFor="subject" className="block inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-wide mb-2">
          Subject or Skill
          <span className="text-[11px] font-medium text-text-muted lowercase tracking-normal block mt-1 normal-case">
            (e.g., "Advanced TypeScript" instead of "Programming")
          </span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          placeholder="e.g., Distributed Systems, React Native, or Product Management"
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all placeholder:text-text-muted"
          required
        />
      </div>
      <div>
        <label htmlFor="goal" className="block inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-wide mb-2">
          Measurable Goal
          <span className="text-[11px] font-medium text-text-muted lowercase tracking-normal block mt-1 normal-case">
            (Define success. E.g., "Build a full-stack e-commerce application")
          </span>
        </label>
        <textarea
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={handleInputChange}
          rows={5}
          placeholder="e.g., 'Build a mobile app', 'Prepare for a technical interview', 'Understand the core concepts'"
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all resize-none placeholder:text-text-muted"
          required
        />
      </div>
    </div>
  );
};

export default SubjectAndGoalStep;
