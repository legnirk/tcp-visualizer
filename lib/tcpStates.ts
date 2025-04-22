// tcp-visualizer/lib/tcpStates.ts

export type TCPState = 
  | 'CLOSED' 
  | 'LISTEN' 
  | 'SYN_SENT' 
  | 'SYN_RECEIVED' 
  | 'ESTABLISHED' 
  | 'FIN_WAIT_1' 
  | 'FIN_WAIT_2' 
  | 'CLOSE_WAIT' 
  | 'LAST_ACK' 
  | 'CLOSING' 
  | 'TIME_WAIT';

export interface Transition {
  from: TCPState;
  to: TCPState;
  event: string;
  description: string;
  isClientInitiated?: boolean;
  isServerInitiated?: boolean;
}

export const states: TCPState[] = [
  'CLOSED',
  'LISTEN',
  'SYN_SENT',
  'SYN_RECEIVED',
  'ESTABLISHED',
  'FIN_WAIT_1',
  'FIN_WAIT_2',
  'CLOSE_WAIT',
  'LAST_ACK',
  'CLOSING',
  'TIME_WAIT'
];

// Define all possible transitions in the TCP state machine
export const transitions: Transition[] = [
  { 
    from: 'CLOSED', 
    to: 'LISTEN', 
    event: 'listen()', 
    description: 'Server socket opened',
    isServerInitiated: true
  },
  { 
    from: 'CLOSED', 
    to: 'SYN_SENT', 
    event: 'connect()', 
    description: 'Client initiates connection',
    isClientInitiated: true
  },
  { 
    from: 'LISTEN', 
    to: 'SYN_RECEIVED', 
    event: 'SYN', 
    description: 'Server receives SYN, sends SYN-ACK',
    isClientInitiated: true
  },
  { 
    from: 'LISTEN', 
    to: 'CLOSED', 
    event: 'close()', 
    description: 'Server socket closed',
    isServerInitiated: true
  },
  { 
    from: 'SYN_SENT', 
    to: 'ESTABLISHED', 
    event: 'SYN-ACK / ACK', 
    description: 'Client receives SYN-ACK, sends ACK',
    isServerInitiated: true
  },
  { 
    from: 'SYN_SENT', 
    to: 'CLOSED', 
    event: 'Timeout/RST', 
    description: 'Connection failed or reset'
  },
  { 
    from: 'SYN_RECEIVED', 
    to: 'ESTABLISHED', 
    event: 'ACK', 
    description: 'Server receives ACK',
    isClientInitiated: true
  },
  { 
    from: 'SYN_RECEIVED', 
    to: 'FIN_WAIT_1', 
    event: 'close()', 
    description: 'Server closes immediately after handshake',
    isServerInitiated: true
  },
  { 
    from: 'SYN_RECEIVED', 
    to: 'CLOSED', 
    event: 'Timeout/RST', 
    description: 'Connection failed or reset'
  },
  { 
    from: 'ESTABLISHED', 
    to: 'FIN_WAIT_1', 
    event: 'close()', 
    description: 'Client initiates connection termination',
    isClientInitiated: true
  },
  { 
    from: 'ESTABLISHED', 
    to: 'CLOSE_WAIT', 
    event: 'FIN', 
    description: 'Server receives termination request',
    isServerInitiated: true
  },
  { 
    from: 'FIN_WAIT_1', 
    to: 'FIN_WAIT_2', 
    event: 'ACK', 
    description: 'Client receives ACK for FIN',
    isServerInitiated: true
  },
  { 
    from: 'FIN_WAIT_1', 
    to: 'CLOSING', 
    event: 'FIN / ACK', 
    description: 'Client receives FIN, sends ACK',
    isServerInitiated: true
  },
  { 
    from: 'FIN_WAIT_1', 
    to: 'TIME_WAIT', 
    event: 'FIN-ACK', 
    description: 'Client receives FIN+ACK, sends ACK',
    isServerInitiated: true
  },
  { 
    from: 'FIN_WAIT_2', 
    to: 'TIME_WAIT', 
    event: 'FIN / ACK', 
    description: 'Client receives FIN, sends ACK',
    isServerInitiated: true
  },
  { 
    from: 'CLOSE_WAIT', 
    to: 'LAST_ACK', 
    event: 'close()', 
    description: 'Server sends FIN',
    isServerInitiated: true
  },
  { 
    from: 'LAST_ACK', 
    to: 'CLOSED', 
    event: 'ACK', 
    description: 'Server receives final ACK',
    isClientInitiated: true
  },
  { 
    from: 'CLOSING', 
    to: 'TIME_WAIT', 
    event: 'ACK', 
    description: 'Client receives ACK for FIN',
    isServerInitiated: true
  },
  { 
    from: 'TIME_WAIT', 
    to: 'CLOSED', 
    event: 'Timeout (2MSL)', 
    description: 'Wait timeout completes'
  }
];

// Get possible next states from current state
export const getNextStates = (currentState: TCPState): Transition[] => {
  return transitions.filter(transition => transition.from === currentState);
};

// Get transitions that lead to a state
export const getIncomingTransitions = (state: TCPState): Transition[] => {
  return transitions.filter(transition => transition.to === state);
};

// This maps states into positions for the graph visualization
export const statePositions: Record<TCPState, { x: number, y: number }> = {
  'CLOSED': { x: 6, y: 0 },
  'LISTEN': { x: 3, y: 2 },
  'SYN_SENT': { x: 9, y: 2 },
  'SYN_RECEIVED': { x: 3, y: 4 },
  'ESTABLISHED': { x: 6, y: 6 },
  'FIN_WAIT_1': { x: 3, y: 8 },
  'FIN_WAIT_2': { x: 3, y: 10 },
  'CLOSE_WAIT': { x: 9, y: 8 },
  'LAST_ACK': { x: 9, y: 10 },
  'CLOSING': { x: 6, y: 9 },
  'TIME_WAIT': { x: 6, y: 12 }
};