export interface SessionTime {
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
}

export interface SessionOwner {
  name: string;
  userRef: string;
}

export interface SessionPitch {
  pitchName: string;
  organization_ref: string;
}

export type SessionType = 'PermanentSession' | 'PermanentWeekly' | 'Monthly' | 'Session';
export type SessionStatus = 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending' | 'Processing';

export interface SessionRecord {
  id: string;
  sessionDate: Date;
  sessionTime: SessionTime;
  sessionOwner: SessionOwner;
  pitch: SessionPitch;
  sessionType: SessionType;
  status: SessionStatus;
  collectedAmount?: number;
  reference: { id: string };
}

export interface CalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    sessionId: string;
    ownerName: string;
    sessionType: string;
    status: string;
    timeLabel: string;
    amount?: number;
  };
}

export interface CalendarState {
  selectedOrganizationId: string | null;
  selectedPitch: string | null;
  selectedWeekStart: Date;
  isLoading: boolean;
  error: string | null;
}

export interface PitchRecord {
  id: string;
  name: string;
  organization_ref: string;
  type?: string;
  status?: string;
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}