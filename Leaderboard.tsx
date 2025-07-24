import React from 'react';

interface LeaderboardEntry {
  name: string;
  value: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  label?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, label }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[220px]">
      <div className="font-semibold mb-2">{label || 'Leaderboard'}</div>
      <ol className="list-decimal ml-4 space-y-1">
        {entries.length === 0 && <li className="text-gray-400">No data</li>}
        {entries.map((entry, idx) => (
          <li key={idx} className="flex justify-between text-sm text-gray-700">
            <span>{entry.name}</span>
            <span className="font-bold">{entry.value}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard; 