import { TreeHarvestEvent } from './types';

const HARVESTS_STORAGE_KEY = 'eulerfold_recent_tree_harvests';

/**
 * Dispatches a global tree harvest event so the header bell, grove, and toast update everywhere.
 * Also persists recent harvests into localStorage so page refreshes and navigations preserve history.
 */
export function dispatchTreeHarvest(event: Omit<TreeHarvestEvent, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  
  const fullEvent: TreeHarvestEvent = {
    ...event,
    id: `harvest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };

  // 1. Persist to localStorage
  try {
    const saved = localStorage.getItem(HARVESTS_STORAGE_KEY);
    const list: TreeHarvestEvent[] = saved ? JSON.parse(saved) : [];
    const updated = [fullEvent, ...list.slice(0, 9)];
    localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem('eulerfold_harvest_has_unread', 'true');
  } catch {}

  // 2. Dispatch live event
  window.dispatchEvent(new CustomEvent('eulerfold_tree_planted', { detail: fullEvent }));
}

export function getRecentHarvests(): TreeHarvestEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(HARVESTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
