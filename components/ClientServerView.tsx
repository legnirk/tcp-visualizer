// tcp-visualizer/components/ClientServerView.tsx
import React from 'react';
import { ConnectionState, Packet } from '../lib/types';

interface ClientServerViewProps {
  connectionState: ConnectionState;
}

const ClientServerView: React.FC<ClientServerViewProps> = ({ connectionState }) => {
  const { clientState, serverState, packets } = connectionState;

  const renderPacket = (packet: Packet, index: number) => {
    // Calculate position based on animation progress
    const position = packet.animation.progress * 100;
    
    // Determine packet style based on type
    let packetClass = 'h-6 w-10 absolute flex items-center justify-center text-xs font-bold rounded-sm transform -translate-y-1/2';
    let textClass = 'text-white';
    
    switch (packet.type) {
      case 'SYN':
        packetClass += ' bg-blue-500';
        break;
      case 'SYN-ACK':
        packetClass += ' bg-green-500';
        break;
      case 'ACK':
        packetClass += ' bg-purple-500';
        break;
      case 'FIN':
        packetClass += ' bg-red-500';
        break;
      case 'FIN-ACK':
        packetClass += ' bg-orange-500';
        break;
      case 'DATA':
        packetClass += ' bg-yellow-500';
        textClass = 'text-black';
        break;
      case 'RST':
        packetClass += ' bg-gray-800';
        break;
    }
    
    // Adjust position based on direction
    const left = packet.from === 'client' 
      ? `${position}%` 
      : `${100 - position}%`;
      
    // Position vertically based on direction
    // Client to server packets go on top channel, server to client on bottom
    const top = packet.from === 'client' ? '2px' : 'auto';
    const bottom = packet.from === 'server' ? '2px' : 'auto';
    
    const zIndex = 10 + index;

    return (
      <div 
        key={packet.id}
        className={packetClass}
        style={{ 
          left, 
          top,
          bottom,
          zIndex,
          transition: 'left 0.05s linear'
        }}
      >
        <span className={textClass}>{packet.type}</span>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 mb-8">
      <div className="flex justify-between mb-8">
        <div className="text-center">
          <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-md mx-auto mb-2 flex items-center justify-center">
            <div>
              <div className="font-semibold dark:text-white">Client</div>
              <div className="text-sm mt-2 dark:text-gray-300">{clientState}</div>
            </div>
          </div>
          <p className="text-sm dark:text-gray-300">192.168.1.10</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-20 relative">
            {/* Top channel (client → server) */}
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 absolute top-2"></div>
            
            {/* Bottom channel (server → client) */}
            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 absolute bottom-2"></div>
            
            {/* Render packets */}
            {packets.map(renderPacket)}
            
            {/* Labels */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs text-gray-500 dark:text-gray-400">
              Client → Server
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs text-gray-500 dark:text-gray-400">
              Client ← Server
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-32 h-32 bg-green-100 dark:bg-green-900 rounded-md mx-auto mb-2 flex items-center justify-center">
            <div>
              <div className="font-semibold dark:text-white">Server</div>
              <div className="text-sm mt-2 dark:text-gray-300">{serverState}</div>
            </div>
          </div>
          <p className="text-sm dark:text-gray-300">192.168.1.1</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-700 p-4 rounded border dark:border-gray-600 mb-6">
        <h3 className="font-semibold mb-2 dark:text-white">Connection Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 dark:text-gray-200">Client State: <span className="font-mono dark:text-gray-300">{clientState}</span></p>
            <p className="mb-1 dark:text-gray-200">Client Sequence Number: <span className="font-mono dark:text-gray-300">{connectionState.clientSequenceNumber}</span></p>
            <p className="dark:text-gray-200">Client ACK Number: <span className="font-mono dark:text-gray-300">{connectionState.clientAcknowledgmentNumber}</span></p>
          </div>
          <div>
            <p className="mb-1 dark:text-gray-200">Server State: <span className="font-mono dark:text-gray-300">{serverState}</span></p>
            <p className="mb-1 dark:text-gray-200">Server Sequence Number: <span className="font-mono dark:text-gray-300">{connectionState.serverSequenceNumber}</span></p>
            <p className="dark:text-gray-200">Server ACK Number: <span className="font-mono dark:text-gray-300">{connectionState.serverAcknowledgmentNumber}</span></p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t dark:border-gray-600">
          <p className="dark:text-gray-200">Current Step: <span className="font-mono dark:text-gray-300">{connectionState.currentStep.replace(/_/g, ' ').toUpperCase()}</span></p>
          <p className="dark:text-gray-200">Data Exchanged: <span className="font-mono dark:text-gray-300">{connectionState.dataExchanged ? 'Yes' : 'No'}</span></p>
        </div>
      </div>
    </div>
  );
};

export default ClientServerView;