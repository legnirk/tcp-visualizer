// tcp-visualizer/components/InfoPanel.tsx
import React, { useState } from 'react';

const InfoPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'handshake' | 'closing'>('overview');

  return (
    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex border-b dark:border-gray-700 mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'states' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('states')}
        >
          States
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'handshake' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('handshake')}
        >
          Handshake
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'closing' 
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('closing')}
        >
          Closing
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">What is TCP?</h2>
          <p className="mb-4 dark:text-gray-300">
            TCP (Transmission Control Protocol) is a connection-oriented protocol that provides 
            reliable, ordered, and error-checked delivery of data between applications.
          </p>
          <p className="mb-4 dark:text-gray-300">
            TCP achieves this reliability through a variety of mechanisms:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4 dark:text-gray-300">
            <li>Establishing connections using a three-way handshake</li>
            <li>Assigning sequence numbers to data packets</li>
            <li>Acknowledging received packets</li>
            <li>Using checksums to detect errors</li>
            <li>Retransmitting lost or corrupted packets</li>
            <li>Implementing flow control and congestion control</li>
          </ul>
          <p className="dark:text-gray-300">
            This simulator demonstrates the TCP state machine, showing how connections are established,
            data is transferred, and connections are terminated.
          </p>
        </div>
      )}

      {activeTab === 'states' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">TCP States</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg dark:text-white">CLOSED</h3>
              <p className="dark:text-gray-300">The default state when no connection exists. Initial and final state.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">LISTEN</h3>
              <p className="dark:text-gray-300">Server is waiting for incoming connection requests.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">SYN_SENT</h3>
              <p className="dark:text-gray-300">Client has sent a SYN packet to initiate a connection.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">SYN_RECEIVED</h3>
              <p className="dark:text-gray-300">Server received a SYN and sent a SYN-ACK.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">ESTABLISHED</h3>
              <p className="dark:text-gray-300">The connection is fully established and data can be exchanged.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">FIN_WAIT_1, FIN_WAIT_2</h3>
              <p className="dark:text-gray-300">States during active connection termination (initiator sent FIN).</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">CLOSE_WAIT, LAST_ACK</h3>
              <p className="dark:text-gray-300">States during passive connection termination (received FIN from peer).</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white">TIME_WAIT</h3>
              <p className="dark:text-gray-300">Waiting to ensure remote TCP received the ACK of its FIN.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'handshake' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Three-Way Handshake</h2>
          <p className="mb-4 dark:text-gray-300">
            TCP establishes connections using a three-way handshake:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-4 dark:text-gray-300">
            <li><strong>SYN</strong>: Client sends SYN packet with initial sequence number (ISN)</li>
            <li><strong>SYN-ACK</strong>: Server responds with SYN-ACK, acknowledging client&apos;s SYN and sending its own ISN</li>
            <li><strong>ACK</strong>: Client acknowledges server&apos;s SYN with an ACK packet</li>
          </ol>
          <p className="mb-4 dark:text-gray-300">
            After these three steps, the connection is ESTABLISHED and both sides can send data.
          </p>
          <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded">
            <p className="font-mono text-sm dark:text-gray-300">
              Client → SYN (seq=x) → Server <br />
              Client ← SYN-ACK (seq=y, ack=x+1) ← Server <br />
              Client → ACK (seq=x+1, ack=y+1) → Server
            </p>
          </div>
        </div>
      )}

      {activeTab === 'closing' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Connection Termination</h2>
          <p className="mb-4 dark:text-gray-300">
            TCP uses a four-way handshake to terminate connections:
          </p>
          <ol className="list-decimal pl-6 space-y-2 mb-4 dark:text-gray-300">
            <li><strong>FIN</strong>: Active closer sends FIN packet</li>
            <li><strong>ACK</strong>: Passive closer acknowledges FIN</li>
            <li><strong>FIN</strong>: Passive closer sends its own FIN when ready</li>
            <li><strong>ACK</strong>: Active closer acknowledges FIN, enters TIME_WAIT</li>
          </ol>
          <p className="mb-4 dark:text-gray-300">
            After TIME_WAIT period (typically 2MSL - twice the Maximum Segment Lifetime), 
            the connection returns to CLOSED state.
          </p>
          <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded">
            <p className="font-mono text-sm dark:text-gray-300">
              Client → FIN → Server <br />
              Client ← ACK ← Server <br />
              Client ← FIN ← Server <br />
              Client → ACK → Server
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;