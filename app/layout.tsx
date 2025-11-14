import type { Metadata } from 'next';
import './globals.css';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

export const metadata: Metadata = {
  title: 'NBA Games',
  description: 'Real-time NBA game scores and statistics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-system-gray-6 antialiased">
        <WebSocketProvider>
          {children}
          <ConnectionStatus />
        </WebSocketProvider>
      </body>
    </html>
  );
}
