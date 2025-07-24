import React from 'react';

interface UrgentNeed {
  id: string | number;
  bloodType: string;
  units: number;
  location: string;
}

interface UrgentNeedsProps {
  needs: UrgentNeed[];
}

const UrgentNeeds: React.FC<UrgentNeedsProps> = ({ needs }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[220px]">
      <div className="font-semibold mb-2">Urgent Needs</div>
      <ul className="space-y-2">
        {needs.length === 0 && <li className="text-gray-400">No urgent needs</li>}
        {needs.map((need) => (
          <li key={need.id} className="flex flex-col text-sm text-gray-700">
            <span className="font-bold text-red-600">{need.bloodType}</span>
            <span>{need.units} units at {need.location}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UrgentNeeds; 