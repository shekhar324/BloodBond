import React from 'react';

interface ImpactWidgetProps {
  livesSaved: number;
  totalDonations: number;
}

const ImpactWidget: React.FC<ImpactWidgetProps> = ({ livesSaved, totalDonations }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[180px] flex flex-col items-center">
      <div className="text-3xl mb-2">🌟</div>
      <div className="text-lg font-semibold mb-1">Your Impact</div>
      <div className="text-blue-600 text-2xl font-bold">{livesSaved}</div>
      <div className="text-gray-500 text-sm mb-2">Lives Saved</div>
      <div className="text-green-600 text-lg font-bold">{totalDonations}</div>
      <div className="text-gray-500 text-sm">Total Donations</div>
    </div>
  );
};

export default ImpactWidget; 