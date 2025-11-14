import type { Schedule, GameMetadata, GameSummary, PlayByPlay, ApiError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.message || `API error: ${response.status}`);
  }
  console.log('response', response);
  return response.json();
}

export async function getSchedule(date: string): Promise<Schedule> {
  return fetchApi<Schedule>(`/api/schedules/${date}`);
}

export async function getGameMetadata(gameId: string): Promise<GameMetadata> {
  return fetchApi<GameMetadata>(`/api/games/${gameId}`);
}

export async function getGameSummary(gameId: string): Promise<GameSummary> {
  return fetchApi<GameSummary>(`/api/games/${gameId}/summary`);
}

export async function getPlayByPlay(gameId: string): Promise<PlayByPlay> {
  return fetchApi<PlayByPlay>(`/api/games/${gameId}/pbp`);
}

