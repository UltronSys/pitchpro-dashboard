import { SessionRecord, PitchRecord, Organization } from '@/types/calendar.types';

// Mock organizations data
export const mockOrganizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Al Huda Arena',
    email: 'info@alhudaarena.com',
    phone: '+254 700 123456',
    address: 'Nairobi, Kenya'
  },
  {
    id: 'org-002',
    name: 'Sports Complex Kenya',
    email: 'info@sportscomplex.ke',
    phone: '+254 711 234567',
    address: 'Westlands, Nairobi'
  },
  {
    id: 'org-003',
    name: 'City Stadium',
    email: 'contact@citystadium.com',
    phone: '+254 722 345678',
    address: 'Mombasa Road, Nairobi'
  },
  {
    id: 'org-004',
    name: 'Premier Sports Hub',
    email: 'info@premiersports.co.ke',
    phone: '+254 733 456789',
    address: 'Karen, Nairobi'
  }
];

// Different pitch configurations per organization
const organizationPitches: { [key: string]: { names: string[], types: string[] } } = {
  'org-001': {
    names: ['Main Pitch', 'Training Ground', 'Indoor Court A', 'Indoor Court B'],
    types: ['Football', 'Football', 'Basketball', 'Basketball']
  },
  'org-002': {
    names: ['Field 1', 'Field 2', 'Field 3', 'Tennis Court 1', 'Tennis Court 2'],
    types: ['Football', 'Football', 'Football', 'Tennis', 'Tennis']
  },
  'org-003': {
    names: ['Stadium Pitch', 'Practice Field'],
    types: ['Football', 'Football']
  },
  'org-004': {
    names: ['Premium Field', 'Standard Field', 'Basketball Court', 'Volleyball Court', 'Badminton Court'],
    types: ['Football', 'Football', 'Basketball', 'Volleyball', 'Badminton']
  }
};

// Different owner pools per organization for more realistic data
const organizationOwners: { [key: string]: string[] } = {
  'org-001': [
    'Ahmed Hassan', 'Fatima Al-Rashid', 'Mohammed Ibrahim', 'Aisha Patel',
    'Omar Khalil', 'Zainab Ahmed', 'Ali Hassan', 'Mariam Osman'
  ],
  'org-002': [
    'John Smith', 'Mary Johnson', 'David Wilson', 'Sarah Brown',
    'Michael Davis', 'Jennifer Garcia', 'Robert Martinez', 'Lisa Anderson'
  ],
  'org-003': [
    'James Mwangi', 'Grace Wanjiru', 'Peter Ochieng', 'Susan Kamau',
    'Daniel Kipchoge', 'Faith Njeri', 'Samuel Otieno', 'Rose Muthoni'
  ],
  'org-004': [
    'Elite FC Team', 'Premier Academy', 'Champions United', 'Rising Stars',
    'Victory Sports Club', 'Thunder Strikers', 'Phoenix Warriors', 'Lightning Bolts'
  ]
};

// Realistic session schedules for different organizations
const realisticSchedules: { [key: string]: { dayIndex: number, startHour: number, duration: number, owner: string, type: string, amount: number }[] } = {
  'org-001': [
    // Al Huda Arena - Islamic community center with prayer-conscious timing
    { dayIndex: 1, startHour: 9, duration: 2, owner: 'Ahmed Hassan', type: 'PermanentWeekly', amount: 1500 },
    { dayIndex: 1, startHour: 16, duration: 1, owner: 'Omar Khalil', type: 'PermanentSession', amount: 800 },
    { dayIndex: 2, startHour: 10, duration: 1, owner: 'Fatima Al-Rashid', type: 'Session', amount: 600 },
    { dayIndex: 2, startHour: 17, duration: 2, owner: 'Mohammed Ibrahim', type: 'PermanentWeekly', amount: 1200 },
    { dayIndex: 3, startHour: 8, duration: 1, owner: 'Aisha Patel', type: 'Session', amount: 500 },
    { dayIndex: 3, startHour: 15, duration: 2, owner: 'Zainab Ahmed', type: 'PermanentSession', amount: 1800 },
    { dayIndex: 4, startHour: 9, duration: 1, owner: 'Ali Hassan', type: 'Session', amount: 700 },
    { dayIndex: 4, startHour: 18, duration: 2, owner: 'Mariam Osman', type: 'PermanentWeekly', amount: 1600 },
    { dayIndex: 5, startHour: 14, duration: 3, owner: 'Ahmed Hassan', type: 'Monthly', amount: 2500 },
    { dayIndex: 6, startHour: 10, duration: 2, owner: 'Omar Khalil', type: 'PermanentSession', amount: 1400 }
  ],
  'org-002': [
    // Sports Complex Kenya - Western-style sports facility
    { dayIndex: 1, startHour: 7, duration: 2, owner: 'John Smith', type: 'PermanentWeekly', amount: 2000 },
    { dayIndex: 1, startHour: 19, duration: 1, owner: 'Mary Johnson', type: 'Session', amount: 900 },
    { dayIndex: 2, startHour: 8, duration: 1, owner: 'David Wilson', type: 'Session', amount: 800 },
    { dayIndex: 2, startHour: 17, duration: 2, owner: 'Sarah Brown', type: 'PermanentSession', amount: 1700 },
    { dayIndex: 3, startHour: 6, duration: 2, owner: 'Michael Davis', type: 'PermanentWeekly', amount: 1800 },
    { dayIndex: 3, startHour: 16, duration: 1, owner: 'Jennifer Garcia', type: 'Session', amount: 750 },
    { dayIndex: 4, startHour: 18, duration: 2, owner: 'Robert Martinez', type: 'PermanentSession', amount: 1600 },
    { dayIndex: 5, startHour: 15, duration: 3, owner: 'Lisa Anderson', type: 'Monthly', amount: 2800 },
    { dayIndex: 6, startHour: 9, duration: 4, owner: 'John Smith', type: 'Monthly', amount: 3200 }
  ],
  'org-003': [
    // City Stadium - Large venue with fewer but longer sessions
    { dayIndex: 1, startHour: 15, duration: 3, owner: 'James Mwangi', type: 'Monthly', amount: 3500 },
    { dayIndex: 2, startHour: 14, duration: 2, owner: 'Grace Wanjiru', type: 'PermanentWeekly', amount: 2200 },
    { dayIndex: 3, startHour: 16, duration: 2, owner: 'Peter Ochieng', type: 'PermanentSession', amount: 2000 },
    { dayIndex: 4, startHour: 15, duration: 3, owner: 'Susan Kamau', type: 'Monthly', amount: 3200 },
    { dayIndex: 5, startHour: 17, duration: 2, owner: 'Daniel Kipchoge', type: 'Session', amount: 1800 },
    { dayIndex: 6, startHour: 10, duration: 4, owner: 'Faith Njeri', type: 'Monthly', amount: 4000 },
    { dayIndex: 0, startHour: 14, duration: 3, owner: 'Samuel Otieno', type: 'PermanentWeekly', amount: 2800 }
  ],
  'org-004': [
    // Premier Sports Hub - High-end facility with team bookings
    { dayIndex: 1, startHour: 18, duration: 2, owner: 'Elite FC Team', type: 'PermanentWeekly', amount: 2500 },
    { dayIndex: 2, startHour: 17, duration: 2, owner: 'Premier Academy', type: 'PermanentSession', amount: 2200 },
    { dayIndex: 2, startHour: 19, duration: 1, owner: 'Champions United', type: 'Session', amount: 1200 },
    { dayIndex: 3, startHour: 16, duration: 2, owner: 'Rising Stars', type: 'PermanentWeekly', amount: 2000 },
    { dayIndex: 4, startHour: 18, duration: 2, owner: 'Victory Sports Club', type: 'PermanentSession', amount: 2400 },
    { dayIndex: 5, startHour: 17, duration: 3, owner: 'Thunder Strikers', type: 'Monthly', amount: 3600 },
    { dayIndex: 6, startHour: 9, duration: 2, owner: 'Phoenix Warriors', type: 'Session', amount: 1800 },
    { dayIndex: 6, startHour: 15, duration: 2, owner: 'Lightning Bolts', type: 'PermanentWeekly', amount: 2200 }
  ]
};

// Generate mock sessions for the current week
export const generateMockSessions = (organizationId: string = 'org-001'): SessionRecord[] => {
  const sessions: SessionRecord[] = [];
  const today = new Date();
  const currentWeekStart = getStartOfWeek(today);
  
  const pitchConfig = organizationPitches[organizationId] || organizationPitches['org-001'];
  const pitchNames = pitchConfig.names;
  const schedule = realisticSchedules[organizationId] || realisticSchedules['org-001'];
  
  // Generate realistic scheduled sessions for current week
  schedule.forEach((scheduleItem, index) => {
    const sessionDate = new Date(currentWeekStart);
    sessionDate.setDate(sessionDate.getDate() + scheduleItem.dayIndex);
    
    // Determine status based on day (past sessions are completed)
    const isInPast = scheduleItem.dayIndex < today.getDay() || 
      (scheduleItem.dayIndex === today.getDay() && scheduleItem.startHour < today.getHours());
    
    const session: SessionRecord = {
      id: `session-${organizationId}-${scheduleItem.dayIndex}-${index}`,
      sessionDate: sessionDate,
      sessionTime: {
        startTime: { hour: scheduleItem.startHour, minute: 0 },
        endTime: { hour: scheduleItem.startHour + scheduleItem.duration, minute: 0 }
      },
      sessionOwner: {
        name: scheduleItem.owner,
        userRef: `user-${index}`
      },
      pitch: {
        pitchName: pitchNames[index % pitchNames.length],
        organization_ref: organizationId
      },
      sessionType: scheduleItem.type as 'PermanentSession' | 'PermanentWeekly' | 'Monthly' | 'Session',
      status: isInPast ? 'Completed' : 'Confirmed',
      collectedAmount: scheduleItem.amount,
      reference: { id: `ref-${organizationId}-${scheduleItem.dayIndex}-${index}` }
    };
    
    sessions.push(session);
  });
  
  // Add sessions for previous and next weeks using same schedule pattern
  for (let weekOffset = -1; weekOffset <= 1; weekOffset++) {
    if (weekOffset === 0) continue;
    
    // Use a subset of the schedule for other weeks
    const weekSchedule = schedule.slice(0, Math.ceil(schedule.length / 2));
    
    weekSchedule.forEach((scheduleItem, index) => {
      const sessionDate = new Date(currentWeekStart);
      sessionDate.setDate(sessionDate.getDate() + (weekOffset * 7) + scheduleItem.dayIndex);
      
      const session: SessionRecord = {
        id: `session-${organizationId}-${weekOffset}-${scheduleItem.dayIndex}-${index}`,
        sessionDate: sessionDate,
        sessionTime: {
          startTime: { hour: scheduleItem.startHour, minute: 0 },
          endTime: { hour: scheduleItem.startHour + scheduleItem.duration, minute: 0 }
        },
        sessionOwner: {
          name: scheduleItem.owner,
          userRef: `user-${weekOffset}-${index}`
        },
        pitch: {
          pitchName: pitchNames[index % pitchNames.length],
          organization_ref: organizationId
        },
        sessionType: scheduleItem.type as 'PermanentSession' | 'PermanentWeekly' | 'Monthly' | 'Session',
        status: weekOffset < 0 ? 'Completed' : 'Confirmed',
        collectedAmount: scheduleItem.amount,
        reference: { id: `ref-${organizationId}-${weekOffset}-${scheduleItem.dayIndex}-${index}` }
      };
      
      sessions.push(session);
    });
  }
  
  return sessions.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
};

export const generateMockPitches = (organizationId: string = 'org-001'): PitchRecord[] => {
  const pitchConfig = organizationPitches[organizationId] || organizationPitches['org-001'];
  
  return pitchConfig.names.map((name, index) => ({
    id: `pitch-${organizationId}-${index + 1}`,
    name: name,
    organization_ref: organizationId,
    type: pitchConfig.types[index],
    status: 'Active'
  }));
};

export const generateMockOrganization = (organizationId: string = 'org-001'): Organization => {
  const org = mockOrganizations.find(o => o.id === organizationId);
  return org || mockOrganizations[0];
};

function getStartOfWeek(date: Date): Date {
  const newDate = new Date(date);
  const dayOfWeek = newDate.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  newDate.setDate(newDate.getDate() - diff);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}