'use client';

import { useEffect, useRef } from 'react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import type { WebSocketServerMessage } from '@/types/api';

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketServerMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Hook to access the shared WebSocket connection.
 * This hook now uses the WebSocketContext to maintain a single persistent connection.
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    isConnected,
    connectionError,
    send,
    subscribe,
    subscribeAll,
    unsubscribe,
    unsubscribeAll,
    addMessageListener,
  } = useWebSocketContext();

  const optionsRef = useRef(options);

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Register message listener
  useEffect(() => {
    if (!options.onMessage) return;

    const removeListener = addMessageListener((message: WebSocketServerMessage) => {
      optionsRef.current.onMessage?.(message);
    });

    return removeListener;
  }, [addMessageListener, options.onMessage]);

  return {
    isConnected,
    connectionError,
    send,
    subscribe,
    subscribeAll,
    unsubscribe,
    unsubscribeAll,
  };
}
