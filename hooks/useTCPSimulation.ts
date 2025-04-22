// tcp-visualizer/hooks/useTCPSimulation.ts
import { useReducer, useEffect, useCallback, useRef } from 'react';
import { 
  tcpReducer, 
  initialConnectionState, 
  processDeliveredPackets, 
  processNewPacket 
} from '../lib/tcpSimulation';
import { ConnectionState, TCPSimulationAction, TCPStep } from '../lib/types';

export function useTCPSimulation() {
  const [state, dispatch] = useReducer(tcpReducer, initialConnectionState);
  const processedPackets = useRef(new Set<string>());

  // Process delivered packets
  useEffect(() => {
    const deliveredUnprocessed = state.packets.filter(
      p => p.delivered && 
      p.animation.progress >= 1 && 
      !processedPackets.current.has(p.id)
    );
    
    deliveredUnprocessed.forEach(packet => {
      processedPackets.current.add(packet.id);
      dispatch({ type: 'RECEIVE_PACKET', payload: { packet } });
      
      // For server's CLOSE_WAIT state
      if (state.serverState === 'CLOSE_WAIT' && packet.type === 'ACK') {
        setTimeout(() => {
          dispatch({ type: 'CONTINUE_SERVER_CLOSE' });
        }, 1000);
      }
      
      // Handle TIME_WAIT timeout
      if (state.clientState === 'TIME_WAIT') {
        setTimeout(() => {
          dispatch({ type: 'TIMEOUT' });
        }, 2000);
      }
    });
  }, [state.packets, state.serverState, state.clientState]);

  // Watch for new packets to animate
  useEffect(() => {
    const newPackets = state.packets.filter(
      p => !p.delivered && 
      p.animation.progress === 0 && 
      !processedPackets.current.has(p.id)
    );
    
    newPackets.forEach(packet => {
      processedPackets.current.add(packet.id);
      processNewPacket(packet, dispatch);
    });
  }, [state.packets]);

  // Action handlers
  const startHandshake = useCallback(() => {
    processedPackets.current.clear(); // Clear processed packets on new handshake
    if (state.serverState === 'CLOSED') {
      dispatch({ type: 'START_HANDSHAKE' });
      setTimeout(() => {
        dispatch({ type: 'START_HANDSHAKE' });
      }, 500);
    } else {
      dispatch({ type: 'START_HANDSHAKE' });
    }
  }, [state.serverState]);

  const sendData = useCallback(() => {
    if (state.clientState === 'ESTABLISHED' && state.serverState === 'ESTABLISHED') {
      dispatch({ type: 'SEND_DATA' });
    }
  }, [state.clientState, state.serverState]);

  const sendDataServer = useCallback(() => {
    if (state.clientState === 'ESTABLISHED' && state.serverState === 'ESTABLISHED') {
      dispatch({ type: 'SEND_DATA_SERVER' });
    }
  }, [state.clientState, state.serverState]);

  const closeConnection = useCallback(() => {
    if (state.clientState === 'ESTABLISHED' && state.serverState === 'ESTABLISHED') {
      dispatch({ type: 'CLOSE_CONNECTION' });
    }
  }, [state.clientState, state.serverState]);

  const resetConnection = useCallback(() => {
    processedPackets.current.clear(); // Clear processed packets on reset
    dispatch({ type: 'RESET_CONNECTION' });
  }, []);

  // Add a function to set animation speed
  const setAnimationSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_ANIMATION_SPEED', payload: { speed } });
  }, []);

  // Determine if actions are enabled based on current state
  const canStartHandshake = state.clientState === 'CLOSED' || state.serverState === 'LISTEN';
  const canSendData = state.clientState === 'ESTABLISHED' && state.serverState === 'ESTABLISHED';
  const canCloseConnection = canSendData;

  return {
    state,
    actions: {
      startHandshake,
      sendData,
      sendDataServer,
      closeConnection,
      resetConnection,
      setAnimationSpeed
    },
    canStartHandshake,
    canSendData,
    canCloseConnection
  };
}

export default useTCPSimulation;