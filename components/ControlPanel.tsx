// tcp-visualizer/components/ControlPanel.tsx
import React from 'react';

interface ControlPanelProps {
  onStartHandshake: () => void;
  onSendData: () => void;
  onSendDataServer: () => void;
  onCloseConnection: () => void;
  onReset: () => void;
  canStartHandshake: boolean;
  canSendData: boolean;
  canCloseConnection: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onStartHandshake,
  onSendData,
  onSendDataServer,
  onCloseConnection,
  onReset,
  canStartHandshake,
  canSendData,
  canCloseConnection,
}) => {
  return (
    <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0 justify-center mb-6">
      <button
        onClick={onStartHandshake}
        disabled={!canStartHandshake}
        className={`px-4 py-2 rounded font-medium ${
          canStartHandshake
            ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        Start Handshake
      </button>
      
      <button
        onClick={onSendData}
        disabled={!canSendData}
        className={`px-4 py-2 rounded font-medium ${
          canSendData
            ? 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        Client → Server Data
      </button>
      
      <button
        onClick={onSendDataServer}
        disabled={!canSendData}
        className={`px-4 py-2 rounded font-medium ${
          canSendData
            ? 'bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        Server → Client Data
      </button>
      
      <button
        onClick={onCloseConnection}
        disabled={!canCloseConnection}
        className={`px-4 py-2 rounded font-medium ${
          canCloseConnection
            ? 'bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        Close Connection
      </button>
      
      <button
        onClick={onReset}
        className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
      >
        Reset
      </button>
    </div>
  );
};

export default ControlPanel;