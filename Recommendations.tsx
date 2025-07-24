import React from 'react';

interface Recommendation {
  id: string | number;
  message: string;
  icon?: React.ReactNode;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[220px]">
      <div className="font-semibold mb-2">Recommendations</div>
      <ul className="space-y-2">
        {recommendations.length === 0 && <li className="text-gray-400">No recommendations</li>}
        {recommendations.map((rec) => (
          <li key={rec.id} className="flex items-center text-sm text-gray-700">
            {rec.icon && <span className="mr-2 text-lg">{rec.icon}</span>}
            <span>{rec.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations; 