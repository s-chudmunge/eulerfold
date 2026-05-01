import React from 'react';
import { Metadata } from 'next';
import PlannerClient from './PlannerClient';

export const metadata: Metadata = {
  title: 'Study Planner — EulerFold',
  description: 'Organize your learning journey with a visual study calendar.',
};

export default function PlannerPage() {
  return <PlannerClient />;
}
