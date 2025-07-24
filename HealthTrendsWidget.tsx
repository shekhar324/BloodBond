import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface HealthTrendsWidgetProps {
  data: { date: string; hemoglobin: number; bp: number }[];
  height?: number;
}

const HealthTrendsWidget: React.FC<HealthTrendsWidgetProps> = ({ data, height = 220 }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[260px]">
      <div className="font-semibold mb-2">Health Trends</div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="hemoglobin" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} name="Hemoglobin" />
          <Line type="monotone" dataKey="bp" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} name="BP" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthTrendsWidget; 