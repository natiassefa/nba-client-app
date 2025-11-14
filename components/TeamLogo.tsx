'use client';

import Image from 'next/image';
import { useMemo } from 'react';

interface TeamLogoProps {
  teamAlias: string;
  teamName?: string;
  size?: number;
  className?: string;
}

// Map team aliases to NBA team IDs for CDN URLs
const TEAM_ID_MAP: Record<string, string> = {
  'ATL': '1610612737', // Atlanta Hawks
  'BOS': '1610612738', // Boston Celtics
  'BKN': '1610612751', // Brooklyn Nets
  'CHA': '1610612766', // Charlotte Hornets
  'CHI': '1610612741', // Chicago Bulls
  'CLE': '1610612739', // Cleveland Cavaliers
  'DAL': '1610612742', // Dallas Mavericks
  'DEN': '1610612743', // Denver Nuggets
  'DET': '1610612765', // Detroit Pistons
  'GSW': '1610612744', // Golden State Warriors
  'HOU': '1610612745', // Houston Rockets
  'IND': '1610612754', // Indiana Pacers
  'LAC': '1610612746', // LA Clippers
  'LAL': '1610612747', // Los Angeles Lakers
  'MEM': '1610612763', // Memphis Grizzlies
  'MIA': '1610612748', // Miami Heat
  'MIL': '1610612749', // Milwaukee Bucks
  'MIN': '1610612750', // Minnesota Timberwolves
  'NOP': '1610612740', // New Orleans Pelicans
  'NYK': '1610612752', // New York Knicks
  'OKC': '1610612760', // Oklahoma City Thunder
  'ORL': '1610612753', // Orlando Magic
  'PHI': '1610612755', // Philadelphia 76ers
  'PHX': '1610612756', // Phoenix Suns
  'POR': '1610612757', // Portland Trail Blazers
  'SAC': '1610612758', // Sacramento Kings
  'SAS': '1610612759', // San Antonio Spurs
  'TOR': '1610612761', // Toronto Raptors
  'UTA': '1610612762', // Utah Jazz
  'WAS': '1610612764', // Washington Wizards
};

export function TeamLogo({ teamAlias, teamName, size = 48, className = '' }: TeamLogoProps) {
  const logoUrl = useMemo(() => {
    const teamId = TEAM_ID_MAP[teamAlias.toUpperCase()];
    if (!teamId) {
      // Fallback to a placeholder or generic logo
      return '/logos/placeholder.svg';
    }
    return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
  }, [teamAlias]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt={teamName || `${teamAlias} logo`}
        width={size}
        height={size}
        className="object-contain"
        unoptimized // NBA CDN handles optimization
        onError={(e) => {
          // Fallback to placeholder on error
          (e.target as HTMLImageElement).src = '/logos/placeholder.svg';
        }}
      />
    </div>
  );
}

