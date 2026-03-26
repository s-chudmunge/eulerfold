// @ts-nocheck
import React from 'react';

interface TimeCommitmentStepProps {
  formData: {
    time_value: number;
    time_unit: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  startDate: string | null;
  endDate: string | null;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TimeCommitmentStep: React.FC<TimeCommitmentStepProps> = ({
  formData,
  handleInputChange,
  startDate,
  endDate,
  handleDateChange,
}) => {
  return (
    <div className="space-y-8 manrope-body">
      <div>
        <label htmlFor="time_value" className="block inconsolata-ui text-[13px] font-bold text-text-heading uppercase tracking-wide mb-2">
          Time Commitment
          <span className="text-[11px] font-medium text-text-muted lowercase tracking-normal block mt-1 normal-case">
            (Be realistic about your availability.)
          </span>
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            id="time_value"
            name="time_value"
            value={formData.time_value}
            onChange={handleInputChange}
            min="1"
            placeholder="e.g., 4"
            className="w-1/2 px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all placeholder:text-text-muted"
            required
          />
          <select
            name="time_unit"
            value={formData.time_unit}
            onChange={handleInputChange}
            className="w-1/2 px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all cursor-pointer"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block inconsolata-ui text-[12px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate || ''}
            onChange={handleDateChange}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block inconsolata-ui text-[12px] font-bold text-text-muted uppercase tracking-widest mb-1.5 ml-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate || ''}
            onChange={handleDateChange}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:border-[var(--accent)] outline-none text-text-primary transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeCommitmentStep;
