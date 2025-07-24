import React from 'react';

interface Donation {
  id: string | number;
  donorName: string;
  date: string;
  units: number;
  bloodType: string;
}

interface RecentDonationsProps {
  donations: Donation[];
}

const RecentDonations: React.FC<RecentDonationsProps> = ({ donations }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[220px]">
      <div className="font-semibold mb-2">Recent Donations</div>
      <ul className="space-y-2">
        {donations.length === 0 && <li className="text-gray-400">No recent donations</li>}
        {donations.map((don) => (
          <li key={don.id} className="flex flex-col text-sm text-gray-700">
            <span className="font-bold">{don.donorName}</span>
            <span>{don.units} units • {don.bloodType}</span>
            <span className="text-xs text-gray-400">{don.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentDonations; 