import React from 'react';
import { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';

export const metadata: Metadata = {
  title: 'Previous Year Papers Archive',
  description: 'A comprehensive directory of previous year question papers and answer keys for GATE, IMO, IChO, and more.',
};

export default function ArchivePage() {
  return <ArchiveClient />;
}
