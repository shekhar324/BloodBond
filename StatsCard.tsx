import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, color }) => {
  return (
    <div className={`flex items-center p-4 rounded-xl shadow bg-white min-w-[180px] ${color || ''}`} style={{gap: 16}}>
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  );
};

export default StatsCard; 