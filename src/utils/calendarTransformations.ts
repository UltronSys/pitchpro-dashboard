import { SessionRecord, CalendarEvent, SessionStatus } from '@/types/calendar.types';

export const isValidSession = (session: SessionRecord): boolean => {
  // Only process Confirmed and Completed sessions
  const validStatuses: SessionStatus[] = ['Confirmed', 'Completed'];
  if (!validStatuses.includes(session.status)) {
    return false;
  }
  
  // Validate required fields exist
  if (!session.sessionDate || !session.sessionTime) {
    return false;
  }
  
  if (!session.sessionTime.startTime || !session.sessionTime.endTime) {
    return false;
  }
  
  return true;
};

export const getSessionTypeLabel = (session: SessionRecord): string => {
  // Match FlutterFlow logic exactly
  if (session.sessionType === 'PermanentSession') {
    const amount = session.collectedAmount || 0;
    return `Session - Ksh ${amount.toFixed(0)}`;
  } else if (session.sessionType === 'PermanentWeekly') {
    return 'Weekly';
  } else {
    return 'Monthly';
  }
};

export const formatTime = (date: Date): string => {
  // Match FlutterFlow DateFormat.jm() format
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export const formatTimeRange = (startDate: Date, endDate: Date): string => {
  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};

export const createSessionDateTime = (sessionDate: Date, time: { hour: number; minute: number }): Date => {
  const dateTime = new Date(sessionDate);
  dateTime.setHours(time.hour, time.minute, 0, 0);
  return dateTime;
};

export const transformSessionToEvent = (session: SessionRecord): CalendarEvent => {
  // Create start and end DateTime objects
  const startDateTime = createSessionDateTime(
    session.sessionDate,
    session.sessionTime.startTime
  );
  
  const endDateTime = createSessionDateTime(
    session.sessionDate,
    session.sessionTime.endTime
  );
  
  // Match FlutterFlow color scheme exactly
  const isCompleted = session.status === 'Completed';
  const backgroundColor = isCompleted ? '#D1D5DB' : '#2C6E49'; // primaryColor from FlutterFlow
  const borderColor = isCompleted ? '#9CA3AF' : '#2C6E49';
  const textColor = isCompleted ? '#000000' : '#FFFFFF';
  
  // Match FlutterFlow display format exactly
  const ownerName = session.sessionOwner?.name || 'Unknown';
  const sessionTypeLabel = getSessionTypeLabel(session);
  const timeLabel = formatTimeRange(startDateTime, endDateTime);
  const statusLabel = session.status;
  
  // Match FlutterFlow subject format: "$ownerName\n$sessionTypeLine\n$timeLabel\nStatus: $statusLabel"
  const title = `${ownerName}\n${sessionTypeLabel}\n${timeLabel}\nStatus: ${statusLabel}`;
  
  return {
    id: session.id,
    start: startDateTime,
    end: endDateTime,
    title: title,
    backgroundColor,
    borderColor,
    textColor,
    extendedProps: {
      sessionId: session.id,
      ownerName,
      sessionType: sessionTypeLabel,
      status: session.status,
      timeLabel,
      amount: session.collectedAmount
    }
  };
};

export const processSessionsForCalendar = (sessions: SessionRecord[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  for (const session of sessions) {
    // Early exit for invalid sessions
    if (!isValidSession(session)) continue;
    
    try {
      const event = transformSessionToEvent(session);
      events.push(event);
    } catch (error) {
      console.error('Error transforming session:', session.id, error);
      // Skip problematic sessions
      continue;
    }
  }
  
  return events;
};

export const filterSessionsByWeek = (
  sessions: SessionRecord[], 
  weekStart: Date, 
  weekEnd: Date
): SessionRecord[] => {
  return sessions.filter(session => {
    if (!session.sessionDate) return false;
    
    const sessionDate = new Date(session.sessionDate);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });
};