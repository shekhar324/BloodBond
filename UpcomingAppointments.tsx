import React from 'react';

interface Appointment {
  id: string | number;
  date: string;
  time: string;
  name: string;
  location: string;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 min-w-[220px]">
      <div className="font-semibold mb-2">Upcoming Appointments</div>
      <ul className="space-y-2">
        {appointments.length === 0 && <li className="text-gray-400">No upcoming appointments</li>}
        {appointments.map((appt) => (
          <li key={appt.id} className="flex flex-col text-sm text-gray-700">
            <span className="font-bold">{appt.name}</span>
            <span>{appt.date} at {appt.time}</span>
            <span className="text-xs text-gray-400">{appt.location}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingAppointments; 