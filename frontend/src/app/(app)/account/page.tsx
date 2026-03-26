import React from 'react';
import { Metadata } from 'next';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your EulerFold account, view credits, and track transaction history.',
};

export default function AccountPage() {
  return <AccountClient />;
}
