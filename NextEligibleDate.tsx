import React from 'react';

interface NextEligibleDateProps {
  date: string;
}

const NextEligibleDate: React.FC<NextEligibleDateProps> = ({ date }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[180px] flex flex-col items-center">
      <div className="text-3xl mb-2">⏰</div>
      <div className="text-lg font-semibold mb-1">Next Eligible Date</div>
      <div className="text-blue-600 text-xl font-bold">{date}</div>
    </div>
  );
};

export default NextEligibleDate; 