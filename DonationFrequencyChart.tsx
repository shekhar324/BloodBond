import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DonationFrequencyChartProps {
  data: { month: string; donations: number }[];
  height?: number;
}

const DonationFrequencyChart: React.FC<DonationFrequencyChartProps> = ({ data, height = 220 }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[260px]">
      <div className="font-semibold mb-2">Donation Frequency</div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="donations" fill="#2563eb" radius={[8,8,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonationFrequencyChart; 