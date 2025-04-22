// tcp-visualizer/lib/types.ts
import { TCPState } from './tcpStates';

export type TCPParty = 'client' | 'server';

export interface Packet {
  id: string;
  type: 'SYN' | 'SYN-ACK' | 'ACK' | 'FIN' | 'FIN-ACK' | 'RST' | 'DATA';
  from: TCPParty;
  to: TCPParty;
  sequenceNumber?: number;
  acknowledgmentNumber?: number;
  flags: {
    syn: boolean;
    ack: boolean;
    fin: boolean;
    rst: boolean;
  };
  payload?: string;
  timestamp: number;
  delivered: boolean;
  animation: {
    progress: number;  // 0 to 1
    duration: number;  // in ms
  };
}

export interface ConnectionState {
  clientState: TCPState;
  serverState: TCPState;
  packets: Packet[];
  clientSequenceNumber: number;
  serverSequenceNumber: number;
  clientAcknowledgmentNumber: number;
  serverAcknowledgmentNumber: number;
  dataExchanged: boolean;
  isActive: boolean;
  currentStep: TCPStep;
  animationSpeed: number;
}

export type TCPStep = 
  | 'idle'
  | 'handshake_syn'
  | 'handshake_syn_ack'
  | 'handshake_ack'
  | 'data_transfer'
  | 'data_transfer_client'
  | 'data_transfer_server'
  | 'data_ack_server'
  | 'data_ack_client'
  | 'closing_fin_client'
  | 'closing_ack_server'
  | 'closing_fin_server'
  | 'closing_ack_client'
  | 'timed_wait'
  | 'closed'
  | 'reset';

export type TCPSimulationAction = 
  | { type: 'RECEIVE_PACKET'; payload: { packet: Packet } }
  | { type: 'START_HANDSHAKE' }
  | { type: 'SEND_DATA' }
  | { type: 'SEND_DATA_SERVER' }
  | { type: 'CLOSE_CONNECTION' }
  | { type: 'RESET_CONNECTION' }
  | { type: 'TICK' }
  | { type: 'TIMEOUT' }
  | { type: 'CONTINUE_SERVER_CLOSE' }
  | { type: 'SET_ANIMATION_SPEED'; payload: { speed: number } };