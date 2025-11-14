import type { TeamRef } from '@/types/api';

/**
 * Get team display name (alias if available, otherwise name)
 */
export function getTeamDisplayName(team: TeamRef): string {
  return team.alias || team.name;
}

/**
 * Get team abbreviation/alias
 */
export function getTeamAlias(team: TeamRef): string {
  return team.alias || team.name.split(' ').map(w => w[0]).join('').toUpperCase();
}

/**
 * Check if team alias is valid (exists in our mapping)
 */
export function isValidTeamAlias(alias: string): boolean {
  const validAliases = [
    'ATL', 'BOS', 'BKN', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET',
    'GSW', 'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN',
    'NOP', 'NYK', 'OKC', 'ORL', 'PHI', 'PHX', 'POR', 'SAC', 'SAS',
    'TOR', 'UTA', 'WAS'
  ];
  return validAliases.includes(alias.toUpperCase());
}

