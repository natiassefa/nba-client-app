import { format } from 'date-fns';
import type { GameReference, GameSummary, GameMetadata } from '@/types/api';

/**
 * Normalize game status to lowercase
 */
export function normalizeGameStatus(status: string): string {
  return status.toLowerCase();
}

/**
 * Get CSS color class for game status
 */
export function getStatusColor(status: string): string {
  const normalized = normalizeGameStatus(status);
  switch (normalized) {
    case 'scheduled':
      return 'text-[var(--color-system-gray-1)]';
    case 'inprogress':
      return 'text-[var(--color-ios-blue)]';
    case 'closed':
      return 'text-[var(--color-system-gray-2)]';
    default:
      return 'text-[var(--color-system-gray-1)]';
  }
}

/**
 * Get display label for game status
 */
export function getStatusLabel(status: string): string {
  const normalized = normalizeGameStatus(status);
  switch (normalized) {
    case 'scheduled':
      return 'Scheduled';
    case 'inprogress':
      return 'Live';
    case 'closed':
      return 'Final';
    default:
      return status;
  }
}

/**
 * Check if game is in progress or closed
 */
export function isInProgressOrClosed(status: string): boolean {
  const normalized = normalizeGameStatus(status);
  return normalized === 'inprogress' || normalized === 'closed';
}

/**
 * Check if game is in progress
 */
export function isInProgress(status: string): boolean {
  return normalizeGameStatus(status) === 'inprogress';
}

/**
 * Extract team score from flexible summary structure
 */
export function getTeamScore(team: any): number | null {
  if (!team) return null;
  return team.points ?? team.scoring?.points ?? team.totals?.points ?? team.score ?? null;
}

/**
 * Extract period/quarter info from game summary
 */
export function getPeriodInfo(summary: GameSummary | null | undefined): string | null {
  if (!summary) return null;
  
  const period = summary.period ?? summary.quarter ?? summary.clock?.period;
  const clock = summary.clock?.display ?? summary.clock?.time;
  
  if (period && clock) {
    return `Q${period} ${clock}`;
  }
  if (period) {
    return `Q${period}`;
  }
  if (clock) {
    return clock;
  }
  
  return null;
}

/**
 * Format scheduled time from game metadata
 */
export function formatScheduledTime(game: GameReference | GameMetadata): string | null {
  const scheduled = (game as any).scheduled;
  if (!scheduled) return null;
  
  try {
    const date = new Date(scheduled);
    return format(date, 'h:mm a');
  } catch {
    return null;
  }
}

/**
 * Get venue name from game metadata
 */
export function getVenueName(game: GameReference | GameMetadata): string | null {
  const venue = (game as any).venue;
  if (!venue) return null;
  return typeof venue === 'string' ? venue : venue.name;
}

