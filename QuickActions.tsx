import React from 'react';

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: Action[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="flex gap-4 my-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <span className="text-lg">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions; 