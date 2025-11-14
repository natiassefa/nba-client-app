'use client';

import { useWebSocketContext } from '@/contexts/WebSocketContext';

export function ConnectionStatus() {
  // Use the shared WebSocket connection
  const { isConnected, connectionError } = useWebSocketContext();

  if (!isConnected && connectionError) {
    return (
      <div className="fixed bottom-4 right-4 bg-[var(--color-ios-red)] text-white px-4 py-2 rounded-[var(--radius-ios)] shadow-[var(--shadow-ios-lg)] text-sm z-50">
        Connection lost
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-[var(--color-ios-green)] text-white px-4 py-2 rounded-[var(--radius-ios)] shadow-[var(--shadow-ios-lg)] text-sm z-50 opacity-75">
        Connected
      </div>
    );
  }

  return null;
}
