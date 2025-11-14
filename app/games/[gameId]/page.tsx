import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGameMetadata, getGameSummary, getPlayByPlay } from '@/lib/api';
import { getTeamDisplayName } from '@/lib/teams';
import { GameDetailView } from '@/components/GameDetailView';

interface GamePageProps {
  params: Promise<{
    gameId: string;
  }>;
}

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  try {
    const { gameId } = await params;
    const metadata = await getGameMetadata(gameId);
    const homeTeam = getTeamDisplayName(metadata.home);
    const awayTeam = getTeamDisplayName(metadata.away);

    return {
      title: `${awayTeam} vs ${homeTeam} - NBA Games`,
      description: `Live scores and updates for ${awayTeam} vs ${homeTeam}`,
    };
  } catch {
    return {
      title: 'Game - NBA Games',
    };
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  let metadata;
  let summary = null;
  let pbp = null;

  try {
    metadata = await getGameMetadata(gameId);
  } catch {
    notFound();
  }

  // Fetch summary and play-by-play in parallel, but don't fail if they're missing
  try {
    [summary, pbp] = await Promise.all([
      getGameSummary(gameId).catch(() => null),
      getPlayByPlay(gameId).catch(() => null),
    ]);

  } catch {
    // Ignore errors for summary/pbp
  }

  return (
    <GameDetailView
      metadata={metadata}
      initialSummary={summary}
      initialPlayByPlay={pbp}
    />
  );
}

