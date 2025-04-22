// tcp-visualizer/page.tsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TCPVisualizer from './components/TCPVisualizer';

// Create a client component that uses useSearchParams
function TCPVisualizerContent() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const isEmbedded = searchParams.get('embedded') === 'true';
  
  useEffect(() => {
    // Simulate loading time or initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add this CSS to hide the header when embedded
  useEffect(() => {
    if (isEmbedded) {
      document.querySelector('header')?.classList.add('hidden');
    }
    
    return () => {
      document.querySelector('header')?.classList.remove('hidden');
    }
  }, [isEmbedded]);

  return (
    <main className={`min-h-screen py-8 px-4 ${isEmbedded ? 'pt-0' : ''} dark:bg-gray-900`}>
      <div className="max-w-6xl mx-auto">
        {!isEmbedded && (
          <>
            <h1 className="text-4xl font-bold mb-6 dark:text-white">TCP State Visualizer</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              This interactive tool helps you understand the TCP protocol by visualizing the TCP state machine, 
              connection establishment (handshake), data transfer, and connection termination processes. 
              Use the controls below to step through each phase of the TCP connection.
            </p>
          </>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="text-xl dark:text-white">Loading visualizer...</div>
          </div>
        ) : (
          <TCPVisualizer />
        )}
      </div>
    </main>
  );
}

// Main page component with Suspense
export default function TCPVisualizerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[500px] dark:text-white">Loading visualizer...</div>}>
      <TCPVisualizerContent />
    </Suspense>
  );
}