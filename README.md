# NBA Client App

A modern Next.js web application for viewing NBA game schedules, scores, and real-time updates. This client application connects to the NBA API service to display game information and receives live updates via WebSocket connections.

## Features

- 📅 **Schedule View**: Browse NBA games by date with intuitive date navigation
- 🏀 **Game Details**: View comprehensive game information including:
  - Game metadata (teams, venue, broadcast info)
  - Live scores and game status
  - Play-by-play events
  - Player statistics
- 🔄 **Real-time Updates**: WebSocket integration for live game updates
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS
- 🔌 **Connection Status**: Visual indicator for WebSocket connection state

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Date Handling**: date-fns
- **Package Manager**: pnpm

## Prerequisites

- **Node.js** 20+ (or 18+)
- **pnpm** (or npm/yarn)
- **NBA API Service** running (see [nba-api-service](../nba-api-service/README.md))


## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables (optional):

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
```

If not set, the app defaults to:
- API URL: `http://localhost:3000`
- WebSocket URL: `ws://localhost:3000/ws`

## Development

Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3001](http://localhost:3001)

### Available Scripts

- `pnpm dev` - Start development server on port 3001
- `pnpm build` - Build for production
- `pnpm start` - Start production server on port 3001
- `pnpm lint` - Run ESLint

## Project Structure

```
nba-client-app/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (schedule view)
│   ├── games/
│   │   └── [gameId]/      # Dynamic game detail pages
│   ├── layout.tsx         # Root layout with WebSocket provider
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ConnectionStatus.tsx    # WebSocket connection indicator
│   ├── DateNavigation.tsx      # Date picker/navigation
│   ├── GameCard.tsx            # Game card component
│   ├── GameDetailView.tsx      # Full game detail view
│   ├── PlayerStats.tsx         # Player statistics display
│   ├── ScheduleView.tsx        # Schedule list view
│   └── TeamLogo.tsx            # Team logo component
├── contexts/             # React contexts
│   └── WebSocketContext.tsx    # WebSocket connection management
├── hooks/                # Custom React hooks
│   ├── useGameUpdates.ts       # Hook for game update subscriptions
│   └── useWebSocket.ts         # WebSocket hook (if exists)
├── lib/                  # Utility functions
│   ├── api.ts            # API client functions
│   ├── games.ts          # Game-related utilities
│   └── teams.ts          # Team-related utilities
└── types/                # TypeScript type definitions
    └── api.ts            # API and WebSocket message types
```

## Key Components

### WebSocketContext

Manages WebSocket connections with automatic reconnection logic:
- Connection state management
- Subscribe/unsubscribe to game updates
- Message listener system
- Exponential backoff reconnection

### ScheduleView

Displays a list of games for a selected date:
- Fetches schedule from API
- Shows game cards with team info and status
- Links to individual game detail pages

### GameDetailView

Comprehensive game detail page showing:
- Game metadata (teams, venue, broadcast)
- Live scores and clock
- Play-by-play events
- Player statistics
- Real-time updates via WebSocket

## API Integration

The app communicates with the NBA API service through REST endpoints:

- `GET /api/schedules/{date}` - Get games for a specific date
- `GET /api/games/{gameId}` - Get game metadata
- `GET /api/games/{gameId}/summary` - Get game summary
- `GET /api/games/{gameId}/pbp` - Get play-by-play events

## WebSocket Integration

Real-time updates are received via WebSocket connection:

**Client Messages:**
- `{ type: 'subscribe', gameId: string }` - Subscribe to a specific game
- `{ type: 'subscribe', all: true }` - Subscribe to all games
- `{ type: 'unsubscribe', gameId: string }` - Unsubscribe from a game
- `{ type: 'unsubscribe', all: true }` - Unsubscribe from all games

**Server Messages:**
- `{ type: 'gameUpdate', gameId, eventType, payload, timestamp }` - Game update event
- `{ type: 'subscribed' | 'unsubscribed', gameId }` - Subscription confirmation
- `{ type: 'error', error: string }` - Error message

## Date Navigation

The home page supports flexible date input:
- Specific dates: `YYYY-MM-DD` format
- Relative dates: `today`, `yesterday`, `tomorrow`
- URL parameter: `?date=2024-01-15` or `?date=today`

## Building for Production

```bash
pnpm build
pnpm start
```

## Related Projects

- [nba-api-service](../nba-api-service/) - REST API and WebSocket server
- [nba-realtime-service](../nba-realtime-service/) - Real-time data polling and processing

## License

Private project - see repository for details.
