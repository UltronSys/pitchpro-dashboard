import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarSessions } from '../data/mockData';

const Calendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState('Aug 25 - Aug 31');
  
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10+ AM'];

  const getSessionsForDay = (dayName: string) => {
    return calendarSessions.filter(session => session.day === dayName);
  };

  const getSessionPosition = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    return hour; // Maps directly to row index
  };

  const getSessionDuration = (startTime: string, endTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    return endHour - startHour;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">{currentWeek}</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">Aug 2025</span>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50"></div>
          {days.map((day, index) => (
            <div key={day} className="p-4 text-center bg-gray-50 border-l border-gray-200">
              <span className="font-medium text-gray-900">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="relative">
          {/* Time slots */}
          {timeSlots.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]">
              <div className="p-3 bg-gray-50 border-r border-gray-200 flex items-start">
                <span className="text-xs text-gray-600 font-medium">{time}</span>
              </div>
              {dayNames.map((dayName, dayIndex) => (
                <div key={`${dayName}-${timeIndex}`} className="border-r border-gray-100 relative p-1">
                  {/* Render sessions for this time slot */}
                  {getSessionsForDay(dayName)
                    .filter(session => getSessionPosition(session.startTime) === timeIndex + 1)
                    .map(session => (
                      <div
                        key={session.id}
                        className={`absolute inset-x-1 rounded-lg p-2 text-xs font-medium shadow-sm z-10 ${
                          session.status === 'confirmed' 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        style={{
                          height: `${getSessionDuration(session.startTime, session.endTime) * 60 - 4}px`,
                          top: '2px'
                        }}
                      >
                        <div className="font-medium">{session.title}</div>
                        <div className="text-xs opacity-90">
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span className="text-sm text-gray-600">Confirmed Sessions</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span className="text-sm text-gray-600">Completed Sessions</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;