import React from 'react';

interface Notification {
  id: string | number;
  message: string;
  date?: string;
}

interface NotificationsListProps {
  notifications: Notification[];
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[220px]">
      <div className="font-semibold mb-2">Notifications</div>
      <ul className="space-y-2">
        {notifications.length === 0 && <li className="text-gray-400">No notifications</li>}
        {notifications.map((n) => (
          <li key={n.id} className="text-sm text-gray-700 flex justify-between items-center">
            <span>{n.message}</span>
            {n.date && <span className="text-xs text-gray-400 ml-2">{n.date}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsList; 