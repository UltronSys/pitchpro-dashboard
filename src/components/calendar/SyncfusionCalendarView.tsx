import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScheduleComponent,
  Week,
  Inject,
  ViewsDirective,
  ViewDirective,
  EventSettingsModel,
  ActionEventArgs,
  EventRenderedArgs,
  CellTemplateArgs
} from '@syncfusion/ej2-react-schedule';
import { SessionRecord } from '@/types/calendar.types';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SyncfusionCalendarViewProps {
  sessions: SessionRecord[];
  weekStart: Date;
  onSessionClick?: (sessionId: string) => void;
  onCreateSession?: () => void;
  selectedPitch?: string;
}

interface AppointmentData {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay: boolean;
  Status: string;
  SessionType: string;
  OwnerName: string;
  Amount?: number;
  TimeLabel: string;
  SessionId: string;
  PitchName: string;
}

export const SyncfusionCalendarView: React.FC<SyncfusionCalendarViewProps> = ({
  sessions,
  weekStart,
  onSessionClick,
  onCreateSession,
  selectedPitch
}) => {
  const navigate = useNavigate();

  // Convert sessions to Syncfusion appointment format
  const appointments = useMemo(() => {
    return sessions
      .filter(session => session.status === 'Confirmed' || session.status === 'Completed')
      .map(session => {
        const sessionDate = new Date(session.sessionDate);
        
        // Create start time
        const startTime = new Date(sessionDate);
        startTime.setHours(session.sessionTime.startTime.hour);
        startTime.setMinutes(session.sessionTime.startTime.minute);
        
        // Create end time
        const endTime = new Date(sessionDate);
        endTime.setHours(session.sessionTime.endTime.hour);
        endTime.setMinutes(session.sessionTime.endTime.minute);
        
        // Handle overnight sessions
        if (endTime <= startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }

        // Format time label
        const formatTime = (date: Date) => {
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        };

        const timeLabel = `${formatTime(startTime)} - ${formatTime(endTime)}`;

        // Determine session type display
        let sessionTypeDisplay: string = session.sessionType;
        if (session.sessionType === 'PermanentSession' && session.collectedAmount) {
          sessionTypeDisplay = `Permanent • Ksh ${session.collectedAmount.toLocaleString()}`;
        } else if (session.sessionType === 'PermanentWeekly') {
          sessionTypeDisplay = 'Weekly Session';
        } else if (session.sessionType === 'Monthly') {
          sessionTypeDisplay = 'Monthly Session';
        }

        return {
          Id: session.id,
          Subject: `${session.sessionOwner.name}`,
          StartTime: startTime,
          EndTime: endTime,
          IsAllDay: false,
          Status: session.status,
          SessionType: sessionTypeDisplay,
          OwnerName: session.sessionOwner.name,
          Amount: session.collectedAmount,
          TimeLabel: timeLabel,
          SessionId: session.id,
          PitchName: session.pitch.pitchName
        } as AppointmentData;
      });
  }, [sessions]);

  const eventSettings: EventSettingsModel = {
    dataSource: appointments,
    fields: {
      id: 'Id',
      subject: { name: 'Subject' },
      startTime: { name: 'StartTime' },
      endTime: { name: 'EndTime' },
      isAllDay: { name: 'IsAllDay' }
    }
  };

  // Handle appointment click
  const onEventClick = (args: ActionEventArgs) => {
    if (args.event && onSessionClick) {
      const appointment = args.event as any;
      // Get the session ID from the appointment data
      if (appointment.SessionId) {
        onSessionClick(appointment.SessionId);
      }
    }
  };

  // Custom appointment template
  const eventTemplate = (props: any) => {
    const appointment = props as AppointmentData;
    const isCompleted = appointment.Status === 'Completed';
    
    return (
      <div 
        className="appointment-content"
        style={{
          height: '100%',
          padding: '8px',
          backgroundColor: isCompleted ? '#9CA3AF' : '#2C6E49',
          color: '#FFFFFF',
          borderLeft: `3px solid ${isCompleted ? '#6B7280' : '#1F5437'}`,
          borderRadius: '4px',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {appointment.OwnerName}
          </div>
          <div style={{ opacity: 0.9 }}>
            {appointment.SessionType}
          </div>
        </div>
        <div>
          <div style={{ opacity: 0.8, fontSize: '10px', marginTop: '4px' }}>
            {appointment.TimeLabel}
          </div>
          <div style={{ 
            display: 'inline-block',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 500,
            marginTop: '4px',
            backgroundColor: isCompleted ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
          }}>
            {appointment.Status}
          </div>
        </div>
      </div>
    );
  };

  // Custom event renderer for additional styling
  const onEventRendered = (args: EventRenderedArgs) => {
    const appointment = args.data as AppointmentData;
    if (appointment.Status === 'Completed') {
      args.element.style.backgroundColor = '#9CA3AF';
    } else {
      args.element.style.backgroundColor = '#2C6E49';
    }
  };

  // Empty state
  if (appointments.length === 0) {
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
    <div className="syncfusion-calendar-container bg-white rounded-lg border border-gray-200 overflow-hidden">
      <ScheduleComponent
        height="600px"
        selectedDate={weekStart}
        eventSettings={eventSettings}
        eventClick={onEventClick}
        eventRendered={onEventRendered}
        currentView="Week"
        startHour="00:00"
        endHour="24:00"
        timeScale={{ interval: 60, slotCount: 1 }}
        showHeaderBar={false}
        showWeekend={true}
        firstDayOfWeek={1}
        quickInfoTemplates={{
          content: eventTemplate
        }}
        readonly={false}
        allowDragAndDrop={false}
        allowResizing={false}
      >
        <ViewsDirective>
          <ViewDirective option="Week" />
        </ViewsDirective>
        <Inject services={[Week]} />
      </ScheduleComponent>
    </div>
  );
};