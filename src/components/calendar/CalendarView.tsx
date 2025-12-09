import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { SessionRecord, CalendarEvent } from '@/types/calendar.types';
import { processSessionsForCalendar } from '@/utils/calendarTransformations';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  sessions: SessionRecord[];
  weekStart: Date;
  onSessionClick?: (sessionId: string) => void;
  onCreateSession?: () => void;
  selectedPitch?: string;
}

const CustomEventContent: React.FC<EventContentArg> = (eventInfo) => {
  const { extendedProps } = eventInfo.event;
  const isCompleted = extendedProps.status === 'Completed';
  
  // Display format matching Flutter implementation
  const ownerName = extendedProps.ownerName;
  const sessionType = extendedProps.sessionType;
  const timeLabel = extendedProps.timeLabel;
  const status = extendedProps.status;
  
  return (
    <div 
      className="p-2 text-xs leading-tight rounded-md cursor-pointer transition-all hover:shadow-lg overflow-hidden h-full flex flex-col justify-between"
      style={{
        backgroundColor: isCompleted ? '#9CA3AF' : '#2C6E49',
        color: '#FFFFFF',
        borderLeft: `3px solid ${isCompleted ? '#6B7280' : '#1F5437'}`,
        fontSize: '11px'
      }}
    >
      <div>
        <div className="font-semibold truncate mb-1">
          {ownerName}
        </div>
        <div className="opacity-90 truncate">
          {sessionType}
        </div>
      </div>
      <div>
        <div className="opacity-80 text-xs mt-1">
          {timeLabel}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
            isCompleted 
              ? 'bg-gray-700 text-gray-100' 
              : 'bg-green-700 text-green-100'
          }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  weekStart,
  onSessionClick,
  onCreateSession,
  selectedPitch
}) => {
  const calendarEvents = useMemo(() => 
    processSessionsForCalendar(sessions),
    [sessions]
  );

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onSessionClick) {
      onSessionClick(clickInfo.event.extendedProps.sessionId);
    }
  };

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);

  if (calendarEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="text-center">
          <CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No sessions found</h3>
          <p className="text-gray-600 mb-4">
            {selectedPitch 
              ? `No sessions found for ${selectedPitch} this week`
              : 'No sessions scheduled for this week'
            }
          </p>
          {onCreateSession && (
            <Button onClick={onCreateSession}>
              Create New Session
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container bg-white rounded-lg border border-gray-200 overflow-hidden">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        validRange={{
          start: weekStart,
          end: weekEnd
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        slotDuration="01:00:00"
        slotLabelInterval="01:00"
        allDaySlot={false}
        firstDay={1}
        events={calendarEvents}
        eventClick={handleEventClick}
        eventContent={CustomEventContent}
        height="600px"
        dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
        expandRows={true}
        eventDisplay="block"
        eventMinHeight={80}
        eventMaxStack={3}
        nowIndicator={true}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        dayHeaderContent={(args) => {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const dayIndex = args.date.getDay();
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          const isToday = new Date().toDateString() === args.date.toDateString();
          return (
            <div className={`text-center py-3 ${isToday ? 'bg-green-50 rounded-t-lg' : ''}`}>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: isToday ? '#2C6E49' : '#6B7280' }}>
                {days[adjustedIndex]}
              </div>
              <div className={`text-xl font-bold mt-1 ${isToday ? 'text-green-700' : 'text-gray-900'}`}>
                {args.date.getDate()}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};