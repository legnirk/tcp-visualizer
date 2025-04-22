// tcp-visualizer/lib/tcpSimulation.ts
import { v4 as uuidv4 } from 'uuid';
import { ConnectionState, Packet, TCPParty, TCPSimulationAction, TCPStep } from './types';
import { TCPState } from './tcpStates';

// Initial state for the TCP connection
export const initialConnectionState: ConnectionState = {
  clientState: 'CLOSED',
  serverState: 'CLOSED',
  packets: [],
  clientSequenceNumber: 0,
  serverSequenceNumber: 0,
  clientAcknowledgmentNumber: 0,
  serverAcknowledgmentNumber: 0,
  dataExchanged: false,
  isActive: false,
  currentStep: 'idle',
  animationSpeed: 1000 // Default animation speed (1 second)
};

// Helper to create a packet
const createPacket = (
  type: Packet['type'],
  from: TCPParty,
  to: TCPParty,
  sequenceNumber: number,
  acknowledgmentNumber: number,
  flags: Packet['flags'],
  animationSpeed: number,
  payload?: string
): Packet => ({
  id: uuidv4(),
  type,
  from,
  to,
  sequenceNumber,
  acknowledgmentNumber,
  flags,
  payload,
  timestamp: Date.now(),
  delivered: false,
  animation: {
    progress: 0,
    duration: animationSpeed
  }
});

// TCP connection state reducer
export const tcpReducer = (
  state: ConnectionState,
  action: TCPSimulationAction
): ConnectionState => {
  switch (action.type) {
    case 'START_HANDSHAKE': {
      // Server must be in LISTEN state before client can connect
      if (state.serverState !== 'LISTEN') {
        const newState = {
          ...state,
          serverState: 'LISTEN' as TCPState
        };
        return newState;
      }

      // Initialize 3-way handshake
      const initialSequenceNumber = Math.floor(Math.random() * 1000000);
      const synPacket = createPacket(
        'SYN',
        'client',
        'server',
        initialSequenceNumber,
        0,
        { syn: true, ack: false, fin: false, rst: false },
        state.animationSpeed
      );

      return {
        ...state,
        clientState: 'SYN_SENT',
        clientSequenceNumber: initialSequenceNumber + 1,
        packets: [...state.packets, synPacket],
        isActive: true,
        currentStep: 'handshake_syn'
      };
    }

    case 'RECEIVE_PACKET': {
      const { packet } = action.payload;
      const updatedPackets = state.packets.map(p => 
        p.id === packet.id ? { ...p, delivered: true } : p
      );

      // Handle different packet types based on current state
      if (packet.type === 'SYN' && state.serverState === 'LISTEN') {
        // Server receives SYN
        const serverInitialSeq = Math.floor(Math.random() * 1000000);
        const synAckPacket = createPacket(
          'SYN-ACK',
          'server',
          'client',
          serverInitialSeq,
          packet.sequenceNumber! + 1,
          { syn: true, ack: true, fin: false, rst: false },
          state.animationSpeed
        );

        return {
          ...state,
          serverState: 'SYN_RECEIVED',
          serverSequenceNumber: serverInitialSeq + 1,
          serverAcknowledgmentNumber: packet.sequenceNumber! + 1,
          packets: [...updatedPackets, synAckPacket],
          currentStep: 'handshake_syn_ack'
        };
      }

      if (packet.type === 'SYN-ACK' && state.clientState === 'SYN_SENT') {
        // Client receives SYN-ACK
        const ackPacket = createPacket(
          'ACK',
          'client',
          'server',
          state.clientSequenceNumber,
          packet.sequenceNumber! + 1,
          { syn: false, ack: true, fin: false, rst: false },
          state.animationSpeed
        );

        return {
          ...state,
          clientState: 'ESTABLISHED',
          clientAcknowledgmentNumber: packet.sequenceNumber! + 1,
          packets: [...updatedPackets, ackPacket],
          currentStep: 'handshake_ack'
        };
      }

      if (packet.type === 'ACK' && state.serverState === 'SYN_RECEIVED') {
        // Server receives ACK (final handshake step)
        return {
          ...state,
          serverState: 'ESTABLISHED',
          currentStep: 'data_transfer'
        };
      }

      // Handle FIN from client (active close)
      if (packet.type === 'FIN' && packet.from === 'client' && state.serverState === 'ESTABLISHED') {
        const ackPacket = createPacket(
          'ACK',
          'server',
          'client',
          state.serverSequenceNumber,
          packet.sequenceNumber! + 1,
          { syn: false, ack: true, fin: false, rst: false },
          state.animationSpeed
        );

        return {
          ...state,
          serverState: 'CLOSE_WAIT',
          serverAcknowledgmentNumber: packet.sequenceNumber! + 1,
          packets: [...updatedPackets, ackPacket],
          currentStep: 'closing_ack_server'
        };
      }

      // Handle ACK from server for client's FIN
      if (packet.type === 'ACK' && packet.from === 'server' && state.clientState === 'FIN_WAIT_1') {
        return {
          ...state,
          clientState: 'FIN_WAIT_2',
          currentStep: 'closing_fin_server'
        };
      }

      // Handle FIN from server (after CLOSE_WAIT)
      if (packet.type === 'FIN' && packet.from === 'server' && 
          (state.clientState === 'FIN_WAIT_1' || state.clientState === 'FIN_WAIT_2')) {
        const ackPacket = createPacket(
          'ACK',
          'client',
          'server',
          state.clientSequenceNumber,
          packet.sequenceNumber! + 1,
          { syn: false, ack: true, fin: false, rst: false },
          state.animationSpeed
        );

        const newClientState = state.clientState === 'FIN_WAIT_1' ? 'CLOSING' : 'TIME_WAIT';
        
        return {
          ...state,
          clientState: newClientState,
          clientAcknowledgmentNumber: packet.sequenceNumber! + 1,
          packets: [...updatedPackets, ackPacket],
          currentStep: 'closing_ack_client'
        };
      }

      // Handle ACK from client for server's FIN
      if (packet.type === 'ACK' && packet.from === 'client' && state.serverState === 'LAST_ACK') {
        return {
          ...state,
          serverState: 'CLOSED',
          currentStep: 'timed_wait'
        };
      }

      // Handle ACK in CLOSING state
      if (packet.type === 'ACK' && state.clientState === 'CLOSING') {
        return {
          ...state,
          clientState: 'TIME_WAIT',
          currentStep: 'timed_wait'
        };
      }

      // Add this new case for handling DATA packets
      if (packet.type === 'DATA') {
        // Determine who should send the ACK
        if (packet.from === 'client' && state.serverState === 'ESTABLISHED') {
          // Server receives data from client, send ACK
          const ackPacket = createPacket(
            'ACK',
            'server',
            'client',
            state.serverSequenceNumber,
            state.clientSequenceNumber, // ACK the client's sequence number
            { syn: false, ack: true, fin: false, rst: false },
            state.animationSpeed
          );

          return {
            ...state,
            serverAcknowledgmentNumber: state.clientSequenceNumber, // Update server's ACK number
            packets: [...updatedPackets, ackPacket],
            currentStep: 'data_ack_server'
          };
        } else if (packet.from === 'server' && state.clientState === 'ESTABLISHED') {
          // Client receives data from server, send ACK (for Issue 3)
          const ackPacket = createPacket(
            'ACK',
            'client',
            'server',
            state.clientSequenceNumber,
            state.serverSequenceNumber, // ACK the server's sequence number
            { syn: false, ack: true, fin: false, rst: false },
            state.animationSpeed
          );

          return {
            ...state,
            clientAcknowledgmentNumber: state.serverSequenceNumber, // Update client's ACK number
            packets: [...updatedPackets, ackPacket],
            currentStep: 'data_ack_client'
          };
        }
      }

      return {
        ...state,
        packets: updatedPackets
      };
    }
    
    case 'SEND_DATA': {
      if (state.clientState !== 'ESTABLISHED' || state.serverState !== 'ESTABLISHED') {
        return state;
      }

      const payload = "This is some sample data being sent over the TCP connection";
      const dataPacket = createPacket(
        'DATA',
        'client',
        'server',
        state.clientSequenceNumber,
        state.clientAcknowledgmentNumber,
        { syn: false, ack: false, fin: false, rst: false },
        state.animationSpeed,
        payload
      );

      const newClientSeq = state.clientSequenceNumber + payload.length;

      return {
        ...state,
        clientSequenceNumber: newClientSeq,
        packets: [...state.packets, dataPacket],
        dataExchanged: true,
        currentStep: 'data_transfer_client'
      };
    }

    case 'CLOSE_CONNECTION': {
      if (state.clientState !== 'ESTABLISHED') {
        return state;
      }

      // Client initiates connection termination
      const finPacket = createPacket(
        'FIN',
        'client',
        'server',
        state.clientSequenceNumber,
        state.clientAcknowledgmentNumber,
        { syn: false, ack: false, fin: true, rst: false },
        state.animationSpeed
      );

      return {
        ...state,
        clientState: 'FIN_WAIT_1',
        clientSequenceNumber: state.clientSequenceNumber + 1,
        packets: [...state.packets, finPacket],
        currentStep: 'closing_fin_client'
      };
    }

    case 'TIMEOUT': {
      if (state.clientState === 'TIME_WAIT') {
        return {
          ...state,
          clientState: 'CLOSED',
          isActive: false,
          currentStep: 'closed'
        };
      }
      return state;
    }

    case 'TICK': {
      const updatedPackets = state.packets.map(packet => {
        if (packet.delivered) {
          return packet;
        }

        const newProgress = Math.min(
          packet.animation.progress + (16 / packet.animation.duration), 
          1
        );
        
        return {
          ...packet,
          animation: {
            ...packet.animation,
            progress: newProgress
          },
          delivered: newProgress >= 1
        };
      });

      return {
        ...state,
        packets: updatedPackets
      };
    }

    case 'RESET_CONNECTION': {
      return {
        ...initialConnectionState,
        serverState: 'LISTEN' // Start with server in LISTEN state
      };
    }

    case 'CONTINUE_SERVER_CLOSE': {
      return {
        ...state,
        serverState: 'LAST_ACK',
        packets: [...state.packets, createPacket(
          'FIN',
          'server',
          'client',
          state.serverSequenceNumber,
          state.clientSequenceNumber,
          { syn: false, ack: false, fin: true, rst: false },
          state.animationSpeed
        )]
      };
    }

    case 'SET_ANIMATION_SPEED': {
      return {
        ...state,
        animationSpeed: action.payload.speed
      };
    }

    case 'SEND_DATA_SERVER': {
      if (state.clientState !== 'ESTABLISHED' || state.serverState !== 'ESTABLISHED') {
        return state;
      }

      const payload = "This is response data being sent from the server to the client";
      const dataPacket = createPacket(
        'DATA',
        'server',
        'client',
        state.serverSequenceNumber,
        state.serverAcknowledgmentNumber,
        { syn: false, ack: false, fin: false, rst: false },
        state.animationSpeed,
        payload
      );

      const newServerSeq = state.serverSequenceNumber + payload.length;

      return {
        ...state,
        serverSequenceNumber: newServerSeq,
        packets: [...state.packets, dataPacket],
        dataExchanged: true,
        currentStep: 'data_transfer_server'
      };
    }

    default:
      return state;
  }
};

// Step through server's closing process after CLOSE_WAIT
export const continueServerClose = (state: ConnectionState): ConnectionState => {
  if (state.serverState !== 'CLOSE_WAIT') {
    return state;
  }

  const finPacket = createPacket(
    'FIN',
    'server',
    'client',
    state.serverSequenceNumber,
    state.serverAcknowledgmentNumber,
    { syn: false, ack: false, fin: true, rst: false },
    state.animationSpeed
  );

  return {
    ...state,
    serverState: 'LAST_ACK',
    serverSequenceNumber: state.serverSequenceNumber + 1,
    packets: [...state.packets, finPacket]
  };
};

export const processDeliveredPackets = (
  state: ConnectionState,
  dispatch: React.Dispatch<TCPSimulationAction>
) => {
  const deliveredUnprocessed = state.packets.filter(
    p => p.delivered && p.animation.progress >= 1
  );
  
  deliveredUnprocessed.forEach(packet => {
    // Immediately dispatch RECEIVE_PACKET action
    dispatch({ type: 'RECEIVE_PACKET', payload: { packet } });
    
    // For server's CLOSE_WAIT state
    if (state.serverState === 'CLOSE_WAIT' && packet.type === 'ACK') {
      setTimeout(() => {
        const updatedState = continueServerClose(state);
        if (updatedState.packets.length > state.packets.length) {
          const newPackets = updatedState.packets.slice(state.packets.length);
          newPackets.forEach(newPacket => {
            processNewPacket(newPacket, dispatch);
          });
        }
      }, 1000);
    }
    
    // Handle TIME_WAIT timeout
    if (state.clientState === 'TIME_WAIT') {
      setTimeout(() => {
        dispatch({ type: 'TIMEOUT' });
      }, 2000);
    }
  });
};

export const processNewPacket = (
  packet: Packet,
  dispatch: React.Dispatch<TCPSimulationAction>
) => {
  const animationInterval = 16; // ~60fps
  const animationTick = setInterval(() => {
    dispatch({ type: 'TICK' });
  }, animationInterval);

  setTimeout(() => {
    clearInterval(animationTick);
    if (!packet.delivered) {
      dispatch({ 
        type: 'RECEIVE_PACKET', 
        payload: { packet: { ...packet, delivered: true } } 
      });
    }
  }, packet.animation.duration);
};