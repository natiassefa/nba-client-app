import { TeamLogo } from './TeamLogo';
import { getTeamDisplayName, getTeamAlias } from '@/lib/teams';

interface PlayerStatsProps {
  team: any;
  teamRef: { name: string; alias?: string };
}

function getPlayerStats(team: any) {
  const players = team?.players ?? team?.roster ?? [];
  if (!Array.isArray(players)) return [];
  
  return players
    .map((player: any) => {
      const stats = player.statistics ?? player.stats ?? {};
      return {
        name: player.full_name ?? player.name ?? player.display_name ?? 'Unknown',
        points: stats.points ?? stats.pts ?? 0,
        rebounds: stats.rebounds ?? stats.reb ?? stats.total_rebounds ?? 0,
        assists: stats.assists ?? stats.ast ?? 0,
        fg: `${stats.field_goals_made ?? stats.fgm ?? 0}/${stats.field_goals_att ?? stats.fga ?? 0}`,
        fg3: `${stats.three_pointers_made ?? stats['3pt_made'] ?? 0}/${stats.three_pointers_att ?? stats['3pt_att'] ?? 0}`,
        ft: `${stats.free_throws_made ?? stats.ftm ?? 0}/${stats.free_throws_att ?? stats.fta ?? 0}`,
        steals: stats.steals ?? stats.stl ?? 0,
        blocks: stats.blocks ?? stats.blk ?? 0,
        turnovers: stats.turnovers ?? stats.to ?? 0,
        minutes: stats.minutes ?? stats.min ?? '0:00',
      };
    })
    .filter((p: any) => p.points > 0 || p.rebounds > 0 || p.assists > 0)
    .sort((a: any, b: any) => b.points - a.points)
    .slice(0, 10); // Top 10 players
}

export function PlayerStats({ team, teamRef }: PlayerStatsProps) {
  const players = getPlayerStats(team);
  const teamAlias = getTeamAlias(teamRef);

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <TeamLogo teamAlias={teamAlias} teamName={teamRef.name} size={32} />
        <h3 className="text-lg font-bold">{getTeamDisplayName(teamRef)} - Player Stats</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-system-gray-5)]">
              <th className="text-left py-2">Player</th>
              <th className="text-right py-2">PTS</th>
              <th className="text-right py-2">REB</th>
              <th className="text-right py-2">AST</th>
              <th className="text-right py-2">FG</th>
              <th className="text-right py-2">3PT</th>
              <th className="text-right py-2">FT</th>
              <th className="text-right py-2">STL</th>
              <th className="text-right py-2">BLK</th>
              <th className="text-right py-2">TO</th>
              <th className="text-right py-2">MIN</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <tr key={idx} className="border-b border-[var(--color-system-gray-5)]">
                <td className="py-2 font-medium">{player.name}</td>
                <td className="text-right py-2">{player.points}</td>
                <td className="text-right py-2">{player.rebounds}</td>
                <td className="text-right py-2">{player.assists}</td>
                <td className="text-right py-2 text-[var(--color-system-gray-2)]">{player.fg}</td>
                <td className="text-right py-2 text-[var(--color-system-gray-2)]">{player.fg3}</td>
                <td className="text-right py-2 text-[var(--color-system-gray-2)]">{player.ft}</td>
                <td className="text-right py-2">{player.steals || '—'}</td>
                <td className="text-right py-2">{player.blocks || '—'}</td>
                <td className="text-right py-2">{player.turnovers || '—'}</td>
                <td className="text-right py-2 text-[var(--color-system-gray-2)]">{player.minutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

