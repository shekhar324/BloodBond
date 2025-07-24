import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

interface ChartWidgetProps {
  type: 'bar' | 'line' | 'pie';
  data: any[];
  dataKey: string;
  nameKey?: string;
  valueKey?: string;
  color?: string;
  height?: number;
  title?: string;
}

const COLORS = ['#2563eb', '#10b981', '#f59e42', '#ef4444', '#a21caf', '#fbbf24'];

const ChartWidget: React.FC<ChartWidgetProps> = ({ type, data, dataKey, nameKey, valueKey, color, height = 220, title }) => {
  let chart = null;
  if (type === 'bar') {
    chart = (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey || 'name'} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={color || COLORS[0]} radius={[8,8,0,0]} />
      </BarChart>
    );
  } else if (type === 'line') {
    chart = (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={nameKey || 'name'} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={dataKey} stroke={color || COLORS[0]} strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    );
  } else if (type === 'pie') {
    chart = (
      <PieChart>
        <Pie data={data} dataKey={valueKey || 'value'} nameKey={nameKey || 'name'} cx="50%" cy="50%" outerRadius={60} fill={color || COLORS[0]} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  }

  if (!chart) {
    return (
      <div className="bg-white rounded-xl shadow p-4 min-w-[260px]">
        {title && <div className="font-semibold mb-2">{title}</div>}
        <div className="text-gray-400">No chart type selected</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[260px]">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartWidget; 