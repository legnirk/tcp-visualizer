import React from 'react';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ currentSpeed, onSpeedChange }) => {
  const speeds = [
    { value: 2000, label: 'Slow' },
    { value: 1000, label: 'Normal' },
    { value: 500, label: 'Fast' },
    { value: 250, label: 'Very Fast' }
  ];

  return (
    <div className="flex items-center justify-end mb-4">
      <label htmlFor="speed-control" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Animation Speed:
      </label>
      <select
        id="speed-control"
        value={currentSpeed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded px-2 py-1 text-sm"
      >
        {speeds.map((speed) => (
          <option key={speed.value} value={speed.value}>
            {speed.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SpeedControl; 