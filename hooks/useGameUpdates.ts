'use client';

import { useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import type { WebSocketServerMessage } from '@/types/api';

export interface GameUpdate {
  gameId: string;
  eventType: 'summary' | 'pbp';
  payload: any;
  timestamp: string;
}

export interface UseGameUpdatesOptions {
  gameId?: string;
  subscribeToAll?: boolean;
  onUpdate?: (update: GameUpdate) => void;
}

export function useGameUpdates(options: UseGameUpdatesOptions = {}) {
  const { gameId, subscribeToAll = false, onUpdate } = options;
  const onUpdateRef = useRef(onUpdate);

  // Keep callback ref up to date
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const { isConnected, subscribe, subscribeAll, unsubscribe, unsubscribeAll } = useWebSocket({
    onMessage: (message: WebSocketServerMessage) => {
      if (message.type === 'gameUpdate') {
        const update: GameUpdate = {
          gameId: message.gameId,
          eventType: message.eventType,
          payload: message.payload,
          timestamp: message.timestamp,
        };
        onUpdateRef.current?.(update);
      }
    },
  });

  useEffect(() => {
    if (!isConnected) return;

    if (subscribeToAll) {
      subscribeAll();
      return () => {
        unsubscribeAll();
      };
    } else if (gameId) {
      subscribe(gameId);
      return () => {
        unsubscribe(gameId);
      };
    }
  }, [isConnected, gameId, subscribeToAll, subscribe, subscribeAll, unsubscribe, unsubscribeAll]);

  return { isConnected };
}

