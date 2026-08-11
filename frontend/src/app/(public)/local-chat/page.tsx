import React from 'react';
import { Metadata } from 'next';
import LocalChatClient from './LocalChatClient';

export const metadata: Metadata = {
  title: 'Local Playground - EulerFold',
  description: 'Chat with 160+ open-weights models running locally in your browser using WebGPU.',
};

export default function LocalChatPage() {
  return <LocalChatClient />;
}
