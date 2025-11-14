'use client';

import { useEffect, useState } from 'react';
import { getSchedule, getGameSummary } from '@/lib/api';
import { GameCard } from './GameCard';
import type { Schedule, GameSummary } from '@/types/api';

interface ScheduleViewProps {
  date: string;
}

export function ScheduleView({ date }: ScheduleViewProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [summaries, setSummaries] = useState<Map<string, GameSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchedule() {
      try {
        setLoading(true);
        setError(null);
        const data = await getSchedule(date);
        if (!cancelled) {
          setSchedule(data);
          
          // Fetch summaries for games that are in progress or completed
          const gamesToFetch = data.games.filter(
            game => game.status === 'inprogress' || game.status === 'closed'
          );
          
          // Fetch summaries in parallel
          const summaryPromises = gamesToFetch.map(async (game) => {
            try {
              const summary = await getGameSummary(game.id);
              return { gameId: game.id, summary };
            } catch {
              return null;
            }
          });
          
          const results = await Promise.all(summaryPromises);
          const summaryMap = new Map<string, GameSummary>();
          results.forEach((result) => {
            if (result) {
              summaryMap.set(result.gameId, result.summary);
            }
          });
          
          if (!cancelled) {
            setSummaries(summaryMap);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load schedule');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSchedule();

    return () => {
      cancelled = true;
    };
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--color-system-gray-2)]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--color-ios-red)]">{error}</div>
      </div>
    );
  }

  if (!schedule || schedule.games.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--color-system-gray-2)]">No games scheduled for this date</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 gap-4 flex flex-col">
      {schedule.games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          summary={summaries.get(game.id) || null}
        />
      ))}
    </div>
  );
}
