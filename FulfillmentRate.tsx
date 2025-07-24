import React from 'react';

interface FulfillmentRateProps {
  rate: number; // 0-100
}

const FulfillmentRate: React.FC<FulfillmentRateProps> = ({ rate }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[180px] flex flex-col items-center">
      <div className="text-3xl mb-2">📈</div>
      <div className="text-lg font-semibold mb-1">Fulfillment Rate</div>
      <div className="text-blue-600 text-xl font-bold">{rate}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${rate}%` }}></div>
      </div>
    </div>
  );
};

export default FulfillmentRate; 