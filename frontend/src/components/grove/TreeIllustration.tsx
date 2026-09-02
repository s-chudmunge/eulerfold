'use client';

import React from 'react';
import { TreeStage, TreeVariety } from './types';

interface TreeIllustrationProps {
  stage?: TreeStage;
  variety?: TreeVariety;
  size?: number;
}

export function TreeIllustration({ stage, variety, size = 32 }: TreeIllustrationProps) {
  // If variety is explicitly passed, render unique tree silhouettes
  if (variety) {
    if (variety === 'oak') {
      // Broad Leaf Rounded Oak
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="27" rx="8.5" ry="3" fill="var(--border)" opacity="0.6" />
          <path d="M16 27V14" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          {/* Broad rounded canopy */}
          <circle cx="16" cy="11" r="9" fill="#0D9488" />
          <circle cx="11" cy="12" r="6.5" fill="#14B8A6" />
          <circle cx="21" cy="12" r="6.5" fill="#0F766E" />
          <circle cx="16" cy="7" r="5" fill="#2DD4BF" opacity="0.8" />
        </svg>
      );
    }

    if (variety === 'spruce') {
      // Tall Triangular Evergreen Spruce
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="27" rx="7" ry="2.5" fill="var(--border)" opacity="0.6" />
          <path d="M16 27V16" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tiered triangular pine canopy */}
          <polygon points="16,4 23,13 9,13" fill="#0F766E" />
          <polygon points="16,10 24,19 8,19" fill="#115E59" />
          <polygon points="16,16 25,24 7,24" fill="#134E4A" />
        </svg>
      );
    }

    if (variety === 'willow') {
      // Gentle Weeping Willow
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="27" rx="9" ry="3" fill="var(--border)" opacity="0.6" />
          <path d="M16 27V12" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="16" cy="10" rx="9" ry="6" fill="#14B8A6" />
          {/* Drooping vine strands */}
          <path d="M9 13C8 17 8 21 9 24" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M13 14C12 18 12 22 13 25" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 14C20 18 20 22 19 25" stroke="#0F766E" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M23 13C24 17 24 21 23 24" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (variety === 'blossom_oak') {
      // Golden Blossom Oak (Milestone Harvest)
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="27" rx="9" ry="3" fill="var(--border)" opacity="0.6" />
          <path d="M16 27V13" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="10" r="9" fill="#0F766E" />
          <circle cx="12" cy="8" r="6" fill="#14B8A6" />
          <circle cx="20" cy="9" r="6" fill="#0D9488" />
          {/* Golden Amber Blossom Fruits */}
          <circle cx="12" cy="7" r="1.8" fill="#F59E0B" />
          <circle cx="19" cy="8" r="1.8" fill="#F59E0B" />
          <circle cx="15" cy="13" r="1.8" fill="#F59E0B" />
          <circle cx="16" cy="5" r="1.5" fill="#FBBF24" />
        </svg>
      );
    }

    if (variety === 'sapling') {
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <ellipse cx="16" cy="26" rx="8" ry="2.5" fill="var(--border)" opacity="0.6" />
          <path d="M16 26V14" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="12" r="7" fill="#15803D" />
          <circle cx="13" cy="10" r="5" fill="#22C55E" />
          <circle cx="19" cy="11" r="4.5" fill="#16A34A" />
        </svg>
      );
    }

    // Default Pine
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="27" rx="8" ry="2.8" fill="var(--border)" opacity="0.6" />
        <path d="M16 27V13" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="11" r="8.5" fill="#0F766E" />
        <circle cx="13" cy="9" r="6" fill="#14B8A6" />
        <circle cx="19" cy="10" r="5.5" fill="#0D9488" />
        <circle cx="16" cy="6" r="4" fill="#2DD4BF" opacity="0.8" />
      </svg>
    );
  }

  // Fallback to stages if stage prop is passed
  if (stage === 'seed') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="24" rx="8" ry="3" fill="var(--border)" opacity="0.6" />
        <ellipse cx="16" cy="22" rx="3" ry="2" fill="#854D0E" />
        <circle cx="16" cy="21" r="1.5" fill="#A16207" />
      </svg>
    );
  }

  if (stage === 'sprout') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="25" rx="7" ry="2.5" fill="var(--border)" opacity="0.6" />
        <path d="M16 24V16" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 19C13 18 11 15 13 13C15 11 16 14 16 19Z" fill="#22C55E" />
        <path d="M16 17C18 16 20 13 19 11C17 9 16 12 16 17Z" fill="#16A34A" />
      </svg>
    );
  }

  if (stage === 'sapling') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="26" rx="8" ry="2.5" fill="var(--border)" opacity="0.6" />
        <path d="M16 26V14" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="12" r="7" fill="#15803D" />
        <circle cx="13" cy="10" r="5" fill="#22C55E" />
        <circle cx="19" cy="11" r="4.5" fill="#16A34A" />
      </svg>
    );
  }

  if (stage === 'blooming') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <ellipse cx="16" cy="27" rx="9" ry="3" fill="var(--border)" opacity="0.6" />
        <path d="M16 27V13" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="10" r="9" fill="#0F766E" />
        <circle cx="12" cy="8" r="6" fill="#14B8A6" />
        <circle cx="20" cy="9" r="6" fill="#0D9488" />
        <circle cx="12" cy="7" r="1.5" fill="#F59E0B" />
        <circle cx="19" cy="8" r="1.5" fill="#F59E0B" />
        <circle cx="15" cy="13" r="1.5" fill="#F59E0B" />
      </svg>
    );
  }

  // Mature tree default
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="27" rx="9" ry="3" fill="var(--border)" opacity="0.6" />
      <path d="M16 27V13" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="11" r="8.5" fill="#0F766E" />
      <circle cx="13" cy="9" r="6" fill="#14B8A6" />
      <circle cx="19" cy="10" r="5.5" fill="#0D9488" />
      <circle cx="16" cy="6" r="4" fill="#2DD4BF" opacity="0.8" />
    </svg>
  );
}
