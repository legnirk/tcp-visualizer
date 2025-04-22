// tcp-visualizer/components/TCPVisualizer.tsx
import React from 'react';
import ClientServerView from './ClientServerView';
import TCPStateGraph from './TCPStateGraph';
import ControlPanel from './ControlPanel';
import InfoPanel from './InfoPanel';
import SpeedControl from './SpeedControl';
import useTCPSimulation from '../hooks/useTCPSimulation';

const TCPVisualizer: React.FC = () => {
  const { 
    state, 
    actions,
    canStartHandshake,
    canSendData,
    canCloseConnection
  } = useTCPSimulation();

  return (
    <div className="max-w-6xl mx-auto px-2">
      <SpeedControl 
        currentSpeed={state.animationSpeed} 
        onSpeedChange={actions.setAnimationSpeed} 
      />
      
      <ClientServerView connectionState={state} />

      <ControlPanel
        onStartHandshake={actions.startHandshake}
        onSendData={actions.sendData}
        onSendDataServer={actions.sendDataServer}
        onCloseConnection={actions.closeConnection}
        onReset={actions.resetConnection}
        canStartHandshake={canStartHandshake}
        canSendData={canSendData}
        canCloseConnection={canCloseConnection}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="flex justify-center">
          <TCPStateGraph currentState={state.clientState} title="Client State Machine" />
        </div>
        <div className="flex justify-center">
          <TCPStateGraph currentState={state.serverState} title="Server State Machine" />
        </div>
      </div>
      
      
      
      <InfoPanel />
    </div>
  );
};

export default TCPVisualizer;