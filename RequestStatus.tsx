import React from 'react';

interface RequestStatusProps {
  status: string;
  unitsNeeded: number;
  bloodType: string;
  location: string;
}

const RequestStatus: React.FC<RequestStatusProps> = ({ status, unitsNeeded, bloodType, location }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[180px] flex flex-col items-center">
      <div className="text-3xl mb-2">🩸</div>
      <div className="text-lg font-semibold mb-1">Request Status</div>
      <div className="text-blue-600 text-xl font-bold">{status}</div>
      <div className="text-gray-500 text-sm">{unitsNeeded} units • {bloodType}</div>
      <div className="text-gray-400 text-xs">{location}</div>
    </div>
  );
};

export default RequestStatus; 