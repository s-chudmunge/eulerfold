import React from 'react';
import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your EulerFold account, profile, and notification preferences.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
