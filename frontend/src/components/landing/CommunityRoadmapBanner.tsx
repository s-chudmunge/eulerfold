"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase/client';

interface CommunityBannerProps {
    title?: string;
    description?: string;
    showClose?: boolean;
    onOpenModal?: () => void;
}

export default function CommunityRoadmapBanner(props: any) {
  return null;
}

