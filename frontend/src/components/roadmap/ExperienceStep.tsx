// @ts-nocheck
import React from 'react';

interface ExperienceStepProps {
  formData: {
    prior_experience: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ExperienceStep: React.FC<ExperienceStepProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-8 manrope-body">
      <div>
        <label htmlFor="prior_experience" className="block inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-wide mb-2">
          Prior Experience
          <span className="text-[11px] font-medium text-text-muted lowercase tracking-normal block mt-1 normal-case">
            (Optional. Mention relevant skills, projects, or concepts you already know.)
          </span>
        </label>
        <textarea
          id="prior_experience"
          name="prior_experience"
          value={formData.prior_experience}
          onChange={handleInputChange}
          rows={6}
          placeholder="e.g., 'I know basic Python and understand object-oriented programming concepts', or 'I've built simple web pages with HTML/CSS'."
          className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all resize-none placeholder:text-text-muted"
        />
      </div>
    </div>
  );
};

export default ExperienceStep;
