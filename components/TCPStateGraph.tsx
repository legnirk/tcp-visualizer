// tcp-visualizer/components/TCPStateGraph.tsx
"use client";

import React from 'react';
import { statePositions, transitions, TCPState } from '../lib/tcpStates';
import { useTheme } from '../../../context/ThemeContext';

interface TCPStateGraphProps {
  currentState: TCPState;
  title: string;
}

const TCPStateGraph: React.FC<TCPStateGraphProps> = ({ currentState, title }) => {
  const { theme } = useTheme();
  
  // Increase node size for better readability
  const nodeSize = 60; // Increased from 40
  // Adjust dimensions to be more vertical and fit without horizontal scrolling
  const graphWidth = 600; // Reduced from 700 to fit better
  const graphHeight = 650; // Slightly reduced for better fit
  
  // Calculate positions with better scaling
  const maxX = Math.max(...Object.values(statePositions).map(pos => pos.x));
  const maxY = Math.max(...Object.values(statePositions).map(pos => pos.y));
  
  const scaleFactor = {
    x: (graphWidth - nodeSize * 3) / maxX,
    y: (graphHeight - nodeSize * 3) / maxY
  };
  
  const getNodePosition = (state: TCPState) => {
    const basePos = statePositions[state];
    return {
      x: basePos.x * scaleFactor.x + nodeSize,
      y: basePos.y * scaleFactor.y + nodeSize
    };
  };
  
  // Group transitions by source-target pairs to handle multiple edges between same nodes
  const groupedTransitions = transitions.reduce((acc, transition) => {
    const key = `${transition.from}-${transition.to}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(transition);
    return acc;
  }, {} as Record<string, typeof transitions>);
  
  // Create paths for transitions
  const renderEdges = () => {
    let edgeIndex = 0;
    
    return Object.entries(groupedTransitions).flatMap(([key, transitionGroup]) => {
      const [from, to] = key.split('-') as [TCPState, TCPState];
      const fromPos = getNodePosition(from);
      const toPos = getNodePosition(to);
      
      // For self-loops
      if (from === to) {
        return transitionGroup.map((transition, i) => {
          const loopRadius = nodeSize / 2;
          // Distribute self-loops around the node
          const angle = (Math.PI / 4) + (i * Math.PI / 2); // Distribute angles
          const cx = fromPos.x + Math.cos(angle) * loopRadius * 2;
          const cy = fromPos.y + Math.sin(angle) * loopRadius * 2;
          
          const path = `M ${fromPos.x + Math.cos(angle) * nodeSize/2} ${fromPos.y + Math.sin(angle) * nodeSize/2} 
                        C ${cx} ${cy}, 
                          ${cx} ${cy}, 
                          ${fromPos.x + Math.cos(angle + Math.PI) * nodeSize/2} ${fromPos.y + Math.sin(angle + Math.PI) * nodeSize/2}`;
          
          return (
            <g key={`edge-${edgeIndex++}`}>
              <path
                d={path}
                fill="none"
                stroke={theme === 'dark' ? "#aaa" : "#666"}
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                fill={theme === 'dark' ? "#ddd" : "#333"}
                fontSize="10"
                className="select-none"
              >
                {transition.event}
              </text>
            </g>
          );
        });
      } else {
        // For regular transitions between different nodes
        return transitionGroup.map((transition, i) => {
          // Calculate the midpoint
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;
          
          // Calculate the angle of the line
          const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
          
          // Calculate the normal vector (perpendicular to the line)
          const normalX = Math.sin(angle);
          const normalY = -Math.cos(angle);
          
          // Offset the control point based on the index to avoid overlapping
          const offset = (i - (transitionGroup.length - 1) / 2) * 30;
          const controlX = midX + normalX * offset;
          const controlY = midY + normalY * offset;
          
          // Calculate the start and end points on the node circles
          const startX = fromPos.x + Math.cos(angle) * (nodeSize / 2);
          const startY = fromPos.y + Math.sin(angle) * (nodeSize / 2);
          
          const endAngle = Math.atan2(fromPos.y - toPos.y, fromPos.x - toPos.x);
          const endX = toPos.x + Math.cos(endAngle) * (nodeSize / 2);
          const endY = toPos.y + Math.sin(endAngle) * (nodeSize / 2);
          
          // Create a curved path
          const path = `M ${startX} ${startY} 
                        Q ${controlX} ${controlY}, ${endX} ${endY}`;
          
          // Position the label near the control point, slightly offset
          const labelX = controlX;
          const labelY = controlY - 10; // Offset above the line
          
          return (
            <g key={`edge-${edgeIndex++}`}>
              <path
                d={path}
                fill="none"
                stroke={theme === 'dark' ? "#aaa" : "#666"}
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill={theme === 'dark' ? "#ddd" : "#333"}
                fontSize="10"
                className="select-none"
              >
                {transition.event}
              </text>
            </g>
          );
        });
      }
    });
  };
  
  // Create nodes for states
  const renderNodes = () => {
    return Object.keys(statePositions).map((state) => {
      const pos = getNodePosition(state as TCPState);
      const isCurrentState = state === currentState;
      
      return (
        <g key={`node-${state}`}>
          {/* Add a white background circle for better visibility */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={(nodeSize / 2) + 2}
            fill={theme === 'dark' ? "#333" : "white"}
            stroke={theme === 'dark' ? "#555" : "#ddd"}
            strokeWidth="1"
          />
          <circle
            cx={pos.x}
            cy={pos.y}
            r={nodeSize / 2}
            fill={isCurrentState ? (theme === 'dark' ? "#3b82f6" : "#1E43FC") : (theme === 'dark' ? "#222" : "#f8f8f8")}
            stroke={isCurrentState ? (theme === 'dark' ? "#60a5fa" : "#3b82f6") : (theme === 'dark' ? "#444" : "#ccc")}
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y + 4} // Slight vertical adjustment for better centering
            textAnchor="middle" 
            fill={isCurrentState ? "white" : (theme === 'dark' ? "#ddd" : "#333")}
            fontSize="12"
            fontWeight={isCurrentState ? "bold" : "normal"}
            className="select-none"
          >
            {state}
          </text>
        </g>
      );
    });
  };

  return (
    <div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
      <h3 className="font-semibold mb-2 text-foreground">{title}</h3>
      <div className="flex justify-center">
        <svg width={graphWidth} height={graphHeight}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? "#aaa" : "#666"} />
            </marker>
          </defs>
          {/* Draw edges first so nodes appear on top */}
          {renderEdges()}
          {renderNodes()}
        </svg>
      </div>
    </div>
  );
};

export default TCPStateGraph;