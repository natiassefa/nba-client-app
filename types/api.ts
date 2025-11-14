// Team reference from API
export interface TeamRef {
  name: string;
  alias?: string;
  id?: string;
  reference?: string;
  sr_id?: string;
}

// Game reference in schedule
export interface GameReference {
  id: string;
  status: string;
  home: TeamRef;
  away: TeamRef;
}

// Schedule response
export interface Schedule {
  date: string;
  games: GameReference[];
}

// Game metadata (same structure as GameReference but may include additional fields)
export interface GameMetadata extends GameReference {
  coverage?: string;
  scheduled?: string;
  track_on_court?: boolean;
  sr_id?: string;
  reference?: string;
  clock?: string;
  time_zones?: {
    venue?: string;
    home?: string;
    away?: string;
  };
  season?: {
    id?: string;
    year?: number;
    type?: string;
  };
  venue?: {
    id?: string;
    name?: string;
    capacity?: number;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    sr_id?: string;
    location?: {
      lat?: string;
      lng?: string;
    };
  };
  broadcasts?: Array<{
    network?: string;
    type?: string;
    locale?: string;
    channel?: string;
  }>;
}

// Game summary (flexible structure from Sportradar)
export interface GameSummary {
  id: string;
  status: string;
  home: any;
  away: any;
  [key: string]: any;
}

// Play-by-play event
export interface PlayByPlayEvent {
  [key: string]: any;
}

// Play-by-play response
export interface PlayByPlay {
  id: string;
  sequence: number;
  events: PlayByPlayEvent[];
}

// API Error response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// WebSocket message types
export type WebSocketClientMessage =
  | { type: 'subscribe'; gameId: string }
  | { type: 'subscribe'; all: true }
  | { type: 'unsubscribe'; gameId: string }
  | { type: 'unsubscribe'; all: true };

export type WebSocketServerMessage =
  | { type: 'subscribed'; gameId: string }
  | { type: 'subscribed'; all: true }
  | { type: 'unsubscribed'; gameId: string }
  | { type: 'unsubscribed'; all: true }
  | { type: 'error'; error: string }
  | { type: 'gameUpdate'; gameId: string; eventType: 'summary' | 'pbp'; payload: any; timestamp: string };

