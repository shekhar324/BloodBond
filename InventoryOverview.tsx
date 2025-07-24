import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InventoryOverviewProps {
  data: { type: string; units: number }[];
  height?: number;
}

const COLORS = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#a21caf', '#fbbf24', '#6366f1', '#f472b6'];

const InventoryOverview: React.FC<InventoryOverviewProps> = ({ data, height = 220 }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[260px]">
      <div className="font-semibold mb-2">Inventory Overview</div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="units" nameKey="type" cx="50%" cy="50%" outerRadius={60} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryOverview; 