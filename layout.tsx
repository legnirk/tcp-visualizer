import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TCP Visualizer | Drew Kringel',
  description: 'Interactive TCP protocol visualization tool',
};

export default function TCPVisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 