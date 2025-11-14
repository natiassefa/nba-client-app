'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TeamLogo } from './TeamLogo';
import { PlayerStats } from './PlayerStats';
import { useGameUpdates } from '@/hooks/useGameUpdates';
import { getTeamAlias } from '@/lib/teams';
import { format } from 'date-fns';
import type { GameMetadata, GameSummary, PlayByPlay } from '@/types/api';

interface GameDetailViewProps {
  metadata: GameMetadata;
  initialSummary: GameSummary | null;
  initialPlayByPlay: PlayByPlay | null;
}

// Helper functions to extract data from flexible Sportradar structure
function getTeamScore(team: any): number {
  console.log('team', team);  
  return team?.score ?? 0;
}

function getTeamStats(team: any) {
  const stats = team?.statistics ?? team?.stats ?? team?.totals ?? {};
  return {
    fg: stats.field_goals_made ?? stats.fgm ?? stats['field-goals-made'] ?? 0,
    fga: stats.field_goals_att ?? stats.fga ?? stats['field-goals-attempted'] ?? 0,
    fg3: stats.three_pointers_made ?? stats['3pt_made'] ?? stats['three-pointers-made'] ?? 0,
    fg3a: stats.three_pointers_att ?? stats['3pt_att'] ?? stats['three-pointers-attempted'] ?? 0,
    ft: stats.free_throws_made ?? stats.ftm ?? stats['free-throws-made'] ?? 0,
    fta: stats.free_throws_att ?? stats.fta ?? stats['free-throws-attempted'] ?? 0,
    rebounds: stats.rebounds ?? stats.reb ?? stats.total_rebounds ?? 0,
    assists: stats.assists ?? stats.ast ?? 0,
    steals: stats.steals ?? stats.stl ?? 0,
    blocks: stats.blocks ?? stats.blk ?? 0,
    turnovers: stats.turnovers ?? stats.to ?? 0,
    fouls: stats.fouls ?? stats.pf ?? stats.personal_fouls ?? 0,
  };
}

function getPeriodScores(team: any) {
  const periods = team?.scoring ?? team?.periods ?? [];
  if (Array.isArray(periods)) {
    return periods.map((p: any) => p.points ?? p.score ?? 0);
  }
  // Handle object format like { 1: { points: 25 }, 2: { points: 30 } }
  if (typeof periods === 'object') {
    return Object.keys(periods)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => periods[key]?.points ?? periods[key]?.score ?? 0);
  }
  return [];
}

function formatStat(value: number): string {
  return value > 0 ? value.toString() : '—';
}

function getTeamRecord(team: any): string {
  return (team?.wins ?? team?.win ?? '') + '-' + (team?.losses ?? team?.loss ?? '');
}

function formatClock(clock: string): string {
  if (!clock) return '';
  
  // Handle ISO 8601 duration format (PT11M20.00S)
  const iso8601Match = clock.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  if (iso8601Match) {
    const hours = parseInt(iso8601Match[1] || '0', 10);
    const minutes = parseInt(iso8601Match[2] || '0', 10);
    const seconds = Math.floor(parseFloat(iso8601Match[3] || '0'));
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Handle MM:SS format (already formatted)
  if (/^\d{1,2}:\d{2}$/.test(clock)) {
    return clock;
  }
  
  // Return as-is if no match
  return clock;
}

function calculatePercentage(made: number, attempted: number): string {
  if (attempted === 0) return '0.0%';
  return ((made / attempted) * 100).toFixed(1) + '%';
}

function formatPlayByPlayEvent(event: any): React.ReactNode {
  // Extract period/quarter
  const period = event.period ?? event.quarter ?? event.qtr ?? '';
  const periodLabel = period ? `Q${period}` : '';
  
  // Extract and format clock
  const rawClock = event.clock ?? event.time ?? '';
  const formattedClock = rawClock ? formatClock(rawClock) : '';
  
  // Extract scores
  const scoreHome = event.score_home ?? event.home_score ?? event.score?.home;
  const scoreAway = event.score_away ?? event.away_score ?? event.score?.away;
  const scoreDisplay = (scoreHome !== undefined && scoreAway !== undefined) 
    ? `${scoreAway}-${scoreHome}` 
    : '';
  
  // Extract team information
  const teamName = event.team?.name ?? event.team_name ?? '';
  const teamTricode = event.team?.alias ?? event.team_tricode ?? event.team?.tricode ?? '';
  const teamDisplay = teamTricode || teamName || '';
  
  // Extract player information
  const playerName = event.player?.full_name ?? event.player_name ?? event.player_name_i ?? '';
  const playerJersey = event.player?.jersey ?? event.jersey_number ?? '';
  const playerDisplay = playerName 
    ? (playerJersey ? `#${playerJersey} ${playerName}` : playerName)
    : '';
  
  // Extract player ID for link
  const playerId = event.player?.personId ?? event.player?.id ?? event.personId ?? event.playerId ?? event.player_id ?? event.person_id ?? null;
  
  // Extract event description/type
  const description = event.description ?? event.event_type ?? event.action_type ?? event.type ?? '';
  
  // Build the formatted parts as React nodes
  const parts: React.ReactNode[] = [];
  
  // Time and period info
  if (periodLabel && formattedClock) {
    parts.push(`${periodLabel} ${formattedClock}`);
  } else if (periodLabel) {
    parts.push(periodLabel);
  } else if (formattedClock) {
    parts.push(formattedClock);
  }
  
  // Score (if available)
  if (scoreDisplay) {
    parts.push(`(${scoreDisplay})`);
  }
  
  // Team and player
  if (teamDisplay && playerDisplay) {
    if (playerId) {
      parts.push(
        <span key="team-player">
          {teamDisplay}:{' '}
          <a 
            href={`https://www.nba.com/player/${playerId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-ios-blue)] hover:underline"
          >
            {playerDisplay}
          </a>
        </span>
      );
    } else {
      parts.push(`${teamDisplay}: ${playerDisplay}`);
    }
  } else if (teamDisplay) {
    parts.push(teamDisplay);
  } else if (playerDisplay) {
    if (playerId) {
      parts.push(
        <a 
          key="player-link"
          href={`https://www.nba.com/player/${playerId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-ios-blue)] hover:underline"
        >
          {playerDisplay}
        </a>
      );
    } else {
      parts.push(playerDisplay);
    }
  }
  
  // Description/event type
  if (description) {
    parts.push(description);
  }
  
  // If we have meaningful parts, join them with bullet separators
  if (parts.length > 0) {
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 && ' • '}
            {part}
          </span>
        ))}
      </>
    );
  }
  
  // Fallback: show key fields that might be useful
  const fallbackKeys = Object.keys(event).filter(k => {
    const lowerKey = k.toLowerCase();
    return !['id', 'sequence', 'event_num', 'action_number'].includes(lowerKey) &&
           event[k] !== null && event[k] !== undefined && event[k] !== '';
  });
  
  if (fallbackKeys.length > 0) {
    const key = fallbackKeys[0];
    const value = typeof event[key] === 'object' ? JSON.stringify(event[key]) : event[key];
    return `${formattedClock || periodLabel || ''} - ${key}: ${value}`;
  }
  
  return JSON.stringify(event);
}

export function GameDetailView({
  metadata,
  initialSummary,
  initialPlayByPlay,
}: GameDetailViewProps) {
  const [summary, setSummary] = useState<GameSummary | null>(initialSummary);
  const [playByPlay, setPlayByPlay] = useState<PlayByPlay | null>(initialPlayByPlay);

  console.log('summary', initialPlayByPlay);
  // Subscribe to real-time updates for this game
  useGameUpdates({
    gameId: metadata.id,
    onUpdate: (update) => {
      if (update.eventType === 'summary') {
        setSummary(update.payload);
      } else if (update.eventType === 'pbp') {
        setPlayByPlay(update.payload);
      }
    },
  });

  const homeAlias = getTeamAlias(metadata.home);
  const awayAlias = getTeamAlias(metadata.away);
  const homeRecord = getTeamRecord(summary?.home);
  const awayRecord = getTeamRecord(summary?.away);
  const homeScore = getTeamScore(summary?.home);
  const awayScore = getTeamScore(summary?.away);
  const homeStats = getTeamStats(summary?.home);
  const awayStats = getTeamStats(summary?.away);
  const homePeriodScores = getPeriodScores(summary?.home);
  const awayPeriodScores = getPeriodScores(summary?.away);
  
  const clock = summary?.clock ?? '';
  const period = summary?.period ?? summary?.quarter ?? summary?.clock?.period;
  
  // Check if game has started (not scheduled)
  const gameStatus = metadata.status?.toLowerCase() ?? '';
  const hasStarted = gameStatus !== 'scheduled';
  const showScores = hasStarted && (homeScore > 0 || awayScore > 0 || summary !== null);
  
  // Extract metadata information
  const meta = metadata as GameMetadata;
  const venue = meta.venue;
  const scheduled = meta.scheduled;
  const season = meta.season;
  const broadcasts = meta.broadcasts ?? [];
  const coverage = meta.coverage;
  const reference = meta.reference;
  const timeZones = meta.time_zones;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/" className="text-[var(--color-ios-blue)] mb-6 inline-block">
        ← Back to Schedule
      </Link>

      {/* Game Info Header */}
      {(venue || scheduled || season || broadcasts.length > 0) && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {venue && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-system-gray-2)] mb-2">Venue</h3>
                <div className="space-y-1">
                  <div className="font-medium">{venue.name}</div>
                  {venue.address && (
                    <div className="text-sm text-[var(--color-system-gray-2)]">
                      {venue.address}
                    </div>
                  )}
                  {(venue.city || venue.state) && (
                    <div className="text-sm text-[var(--color-system-gray-2)]">
                      {venue.city}{venue.city && venue.state ? ', ' : ''}{venue.state} {venue.zip}
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="text-xs text-[var(--color-system-gray-2)]">
                      Capacity: {venue.capacity.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              {scheduled && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[var(--color-system-gray-2)] mb-2">Scheduled</h3>
                  <div className="font-medium">
                    {format(new Date(scheduled), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-[var(--color-system-gray-2)]">
                    {format(new Date(scheduled), 'h:mm a')}
                    {timeZones?.venue && (
                      <span> ({timeZones.venue})</span>
                    )}
                  </div>
                </div>
              )}
              
              {season && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[var(--color-system-gray-2)] mb-2">Season</h3>
                  <div className="font-medium">
                    {season.year} {season.type === 'REG' ? 'Regular Season' : season.type === 'POST' ? 'Playoffs' : season.type}
                  </div>
                </div>
              )}
              
              {broadcasts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-system-gray-2)] mb-2">Broadcasts</h3>
                  <div className="space-y-1">
                    {broadcasts.map((broadcast, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{broadcast.network}</span>
                        {broadcast.channel && (
                          <span className="text-[var(--color-system-gray-2)]"> (Ch. {broadcast.channel})</span>
                        )}
                        {broadcast.locale && (
                          <span className="text-xs text-[var(--color-system-gray-2)]"> - {broadcast.locale}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {(coverage || reference) && (
            <div className="mt-4 pt-4 border-t border-[var(--color-system-gray-5)] flex gap-4 text-xs text-[var(--color-system-gray-2)]">
              {coverage && <span>Coverage: {coverage}</span>}
              {reference && <span>Reference: {reference}</span>}
            </div>
          )}
        </div>
      )}

      {/* Score Header */}
      <div className="card mb-6">
        {showScores ? (
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-center gap-4 w-full">
                <TeamLogo teamAlias={awayAlias} teamName={metadata.away.name} size={64} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{metadata.away.name}</h2>
                  <div className="text-sm text-[var(--color-system-gray-2)]">
                    {homeRecord}
                  </div>
                </div>
              </div>
              <div className="text-center w-full">
                <div className="text-4xl font-bold">{awayScore}</div>
              </div>
            </div>

            <div className="text-center flex-shrink-0 px-4">
              {clock && (
                <div className="text-sm text-[var(--color-system-gray-2)] mb-1">
                  Q{period} - {formatClock(clock)}
                </div>
              )}
              <div className="text-sm text-[var(--color-system-gray-2)] mb-1">VS</div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-center gap-4 w-full flex-row-reverse">
                <TeamLogo teamAlias={homeAlias} teamName={metadata.home.name} size={64} />
                <div className="flex-1 text-right">
                  <h2 className="text-xl font-bold">{metadata.home.name}</h2>
                  <div className="text-sm text-[var(--color-system-gray-2)]">
                    {awayRecord}
                  </div>
                </div>
              </div>
              <div className="text-center w-full">
                <div className="text-4xl font-bold">{homeScore}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <TeamLogo teamAlias={awayAlias} teamName={metadata.away.name} size={64} />
              <div>
                <h2 className="text-xl font-bold">{metadata.away.name}</h2>
              </div>
            </div>

            <div className="text-center flex-shrink-0 px-4">
              <div className="text-sm font-bold text-[var(--color-system-gray-1)] mb-1">VS</div>
              {scheduled && (
                <div className="text-sm text-[var(--color-system-gray-2)]">
                  {format(new Date(scheduled), 'h:mm a')}
                  {timeZones?.venue && (
                    <span className="text-xs ml-1">({timeZones.venue})</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-1 flex-row-reverse">
              <TeamLogo teamAlias={homeAlias} teamName={metadata.home.name} size={64} />
              <div className="text-right">
                <h2 className="text-xl font-bold">{metadata.home.name}</h2>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <span className="text-sm text-[var(--color-system-gray-1)]">
            Status: {metadata.status}
          </span>
        </div>
      </div>

      {/* Period Scores */}
      {showScores && homePeriodScores.length > 0 && awayPeriodScores.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">Score by Period</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-md font-semibold mb-2">{metadata.away.name}</div>
              <div className="flex gap-2">
                {awayPeriodScores.map((score, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div className="text-xs text-[var(--color-system-gray-2)]">Q{idx + 1}</div>
                    <div className="font-semibold">{score}</div>
                  </div>
                ))}
                <div className="flex-1 text-center border-l border-[var(--color-system-gray-5)] pl-2">
                  <div className="text-xs text-[var(--color-system-gray-2)]">Total</div>
                  <div className="font-bold">{awayScore}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-md font-semibold mb-2">{metadata.home.name}</div>
              <div className="flex gap-2">
                {homePeriodScores.map((score, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <div className="text-xs text-[var(--color-system-gray-2)]">Q{idx + 1}</div>
                    <div className="font-semibold">{score}</div>
                  </div>
                ))}
                <div className="flex-1 text-center border-l border-[var(--color-system-gray-5)] pl-2">
                  <div className="text-xs text-[var(--color-system-gray-2)]">Total</div>
                  <div className="font-bold">{homeScore}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Statistics */}
      {showScores && (homeStats.fga > 0 || awayStats.fga > 0) && (
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">Team Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <th className="text-left py-2"></th>
                  <th className="text-right py-2">{metadata.away.name}</th>
                  <th className="text-right py-2">{metadata.home.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Field Goals</td>
                  <td className="text-right py-2">
                    {formatStat(awayStats.fg)}/{formatStat(awayStats.fga)} ({calculatePercentage(awayStats.fg, awayStats.fga)})
                  </td>
                  <td className="text-right py-2">
                    {formatStat(homeStats.fg)}/{formatStat(homeStats.fga)} ({calculatePercentage(homeStats.fg, homeStats.fga)})
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">3-Pointers</td>
                  <td className="text-right py-2">
                    {formatStat(awayStats.fg3)}/{formatStat(awayStats.fg3a)} ({calculatePercentage(awayStats.fg3, awayStats.fg3a)})
                  </td>
                  <td className="text-right py-2">
                    {formatStat(homeStats.fg3)}/{formatStat(homeStats.fg3a)} ({calculatePercentage(homeStats.fg3, homeStats.fg3a)})
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Free Throws</td>
                  <td className="text-right py-2">
                    {formatStat(awayStats.ft)}/{formatStat(awayStats.fta)} ({calculatePercentage(awayStats.ft, awayStats.fta)})
                  </td>
                  <td className="text-right py-2">
                    {formatStat(homeStats.ft)}/{formatStat(homeStats.fta)} ({calculatePercentage(homeStats.ft, homeStats.fta)})
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Rebounds</td>
                  <td className="text-right py-2">{formatStat(awayStats.rebounds)}</td>
                  <td className="text-right py-2">{formatStat(homeStats.rebounds)}</td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Assists</td>
                  <td className="text-right py-2">{formatStat(awayStats.assists)}</td>
                  <td className="text-right py-2">{formatStat(homeStats.assists)}</td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Steals</td>
                  <td className="text-right py-2">{formatStat(awayStats.steals)}</td>
                  <td className="text-right py-2">{formatStat(homeStats.steals)}</td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Blocks</td>
                  <td className="text-right py-2">{formatStat(awayStats.blocks)}</td>
                  <td className="text-right py-2">{formatStat(homeStats.blocks)}</td>
                </tr>
                <tr className="border-b border-[var(--color-system-gray-5)]">
                  <td className="py-2">Turnovers</td>
                  <td className="text-right py-2">{formatStat(awayStats.turnovers)}</td>
                  <td className="text-right py-2">{formatStat(homeStats.turnovers)}</td>
                </tr>
                <tr>
                  <td className="py-2">Fouls</td>
                  <td className="text-right py-2">{formatStat(awayStats.fouls)}</td>
                  <td className="text-right py-2">{formatStat(homeStats.fouls)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Player Statistics */}
      {summary?.home?.players && (
        <div className="mb-6">
          <PlayerStats team={summary.home} teamRef={metadata.home} />
        </div>
      )}
      {summary?.away?.players && (
        <div className="mb-6">
          <PlayerStats team={summary.away} teamRef={metadata.away} />
        </div>
      )}

      {/* Play-by-Play */}
      {playByPlay && playByPlay.events && playByPlay.events.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Play-by-Play</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {playByPlay.events
              .slice()
              .reverse()
              .map((event, index) => (
                <div key={index} className="text-sm py-2 border-b border-[var(--color-system-gray-5)] last:border-0">
                  <div className="text-[var(--color-system-gray-2)]">
                    {formatPlayByPlayEvent(event)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}
