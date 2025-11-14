'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import type { WebSocketClientMessage, WebSocketServerMessage } from '@/types/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';

interface WebSocketContextValue {
  isConnected: boolean;
  connectionError: string | null;
  send: (message: WebSocketClientMessage) => void;
  subscribe: (gameId: string) => void;
  subscribeAll: () => void;
  unsubscribe: (gameId: string) => void;
  unsubscribeAll: () => void;
  addMessageListener: (listener: (message: WebSocketServerMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageListenersRef = useRef<Set<(message: WebSocketServerMessage) => void>>(new Set());
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketServerMessage = JSON.parse(event.data);
          // Notify all listeners
          messageListenersRef.current.forEach((listener) => {
            try {
              listener(message);
            } catch (err) {
              console.error('Error in WebSocket message listener:', err);
            }
          });
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        setConnectionError('WebSocket connection error');
        isConnectingRef.current = false;
      };

      ws.onclose = () => {
        setIsConnected(false);
        isConnectingRef.current = false;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      setConnectionError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
      isConnectingRef.current = false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    wsRef.current?.close();
    wsRef.current = null;
    isConnectingRef.current = false;
  }, []);

  const send = useCallback((message: WebSocketClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const subscribe = useCallback((gameId: string) => {
    send({ type: 'subscribe', gameId });
  }, [send]);

  const subscribeAll = useCallback(() => {
    send({ type: 'subscribe', all: true });
  }, [send]);

  const unsubscribe = useCallback((gameId: string) => {
    send({ type: 'unsubscribe', gameId });
  }, [send]);

  const unsubscribeAll = useCallback(() => {
    send({ type: 'unsubscribe', all: true });
  }, [send]);

  const addMessageListener = useCallback((listener: (message: WebSocketServerMessage) => void) => {
    messageListenersRef.current.add(listener);
    return () => {
      messageListenersRef.current.delete(listener);
    };
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value: WebSocketContextValue = {
    isConnected,
    connectionError,
    send,
    subscribe,
    subscribeAll,
    unsubscribe,
    unsubscribeAll,
    addMessageListener,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}

