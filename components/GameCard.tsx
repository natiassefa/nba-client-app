'use client';

import Link from 'next/link';
import { TeamLogo } from './TeamLogo';
import { getTeamDisplayName, getTeamAlias } from '@/lib/teams';
import {
  getStatusColor,
  getStatusLabel,
  getTeamScore,
  getPeriodInfo,
  formatScheduledTime,
  getVenueName,
  isInProgressOrClosed,
  normalizeGameStatus,
} from '@/lib/games';
import type { GameReference, GameSummary, GameMetadata } from '@/types/api';
import type { TeamRef } from '@/types/api';

interface GameCardProps {
  game: GameReference | GameMetadata;
  summary?: GameSummary | null;
}

interface TeamDisplayProps {
  team: TeamRef;
  score: number | null;
  showScore: boolean;
  alignRight?: boolean;
}

function TeamDisplay({ team, score, showScore, alignRight = false }: TeamDisplayProps) {
  const alias = getTeamAlias(team);
  const containerClass = alignRight
    ? 'flex items-center gap-3 flex-1 justify-end'
    : 'flex items-center gap-3 flex-1';
  const textClass = alignRight ? 'flex-1 text-right min-w-0' : 'flex-1 min-w-0';

  return (
    <div className={containerClass}>
      {alignRight && (
        <div className={textClass}>
          <div className="font-semibold text-lg truncate">{getTeamDisplayName(team)}</div>
          {showScore && (
            <div className="text-xs text-[var(--color-system-gray-2)]">
              {score !== null ? `${score} pts` : '—'}
            </div>
          )}
        </div>
      )}
      <TeamLogo teamAlias={alias} teamName={team.name} size={40} />
      {!alignRight && (
        <div className={textClass}>
          <div className="font-semibold text-lg truncate">{getTeamDisplayName(team)}</div>
          {showScore && (
            <div className="text-xs text-[var(--color-system-gray-2)]">
              {score !== null ? `${score} pts` : '—'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GameCard({ game, summary }: GameCardProps) {
  const homeScore = summary ? getTeamScore(summary.home) : null;
  const awayScore = summary ? getTeamScore(summary.away) : null;
  const periodInfo = getPeriodInfo(summary);
  const gameStatus = normalizeGameStatus(game.status);
  const showScores = isInProgressOrClosed(game.status) && (homeScore !== null || awayScore !== null);
  const scheduledTime = formatScheduledTime(game);
  const venue = getVenueName(game);

  return (
    <Link href={`/games/${game.id}`}>
      <div className="card-interactive">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getStatusColor(game.status)}`}>
              {getStatusLabel(game.status)}
            </span>
            {scheduledTime && gameStatus === 'scheduled' && (
              <span className="text-xs text-[var(--color-system-gray-2)]">
                {scheduledTime}
              </span>
            )}
          </div>
          {periodInfo && gameStatus === 'inprogress' && (
            <span className="text-xs text-[var(--color-ios-blue)] font-medium">
              {periodInfo}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <TeamDisplay team={game.away} score={awayScore} showScore={showScores} />
          
          {showScores && (
            <div className="text-2xl font-bold mx-4 min-w-[3rem] text-right">
              {awayScore ?? '—'}
            </div>
          )}
          
          <div className="text-[var(--color-system-gray-2)] mx-2">@</div>
          
          {showScores && (
            <div className="text-2xl font-bold mx-4 min-w-[3rem]">
              {homeScore ?? '—'}
            </div>
          )}
          
          <TeamDisplay team={game.home} score={homeScore} showScore={showScores} alignRight />
        </div>
        
        {venue && (
          <div className="mt-3 pt-3 border-t border-[var(--color-system-gray-5)]">
            <div className="text-xs text-[var(--color-system-gray-2)] flex items-center gap-1">
              <span>📍</span>
              <span>{venue}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
