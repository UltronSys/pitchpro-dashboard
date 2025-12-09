// Mock data for the sports facility dashboard

export const kpiData = {
  augustBookings: 64,
  collectedRevenue: 133000.00,
  expectedRevenue: 307750.00,
  avgMonthlyRevenue: 135083.33,
  totalBookings: 79,
};

export const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
  { month: 'Jul', revenue: 71000 },
  { month: 'Aug', revenue: 133000 },
  { month: 'Sep', revenue: 45000 },
  { month: 'Oct', revenue: 52000 },
  { month: 'Nov', revenue: 48000 },
  { month: 'Dec', revenue: 61000 },
];

export const bookingsData = [
  { month: 'Jan', bookings: 45 },
  { month: 'Feb', bookings: 52 },
  { month: 'Mar', bookings: 48 },
  { month: 'Apr', bookings: 61 },
  { month: 'May', bookings: 55 },
  { month: 'Jun', bookings: 67 },
  { month: 'Jul', bookings: 71 },
  { month: 'Aug', bookings: 64 },
  { month: 'Sep', bookings: 45 },
  { month: 'Oct', bookings: 52 },
  { month: 'Nov', bookings: 48 },
  { month: 'Dec', bookings: 61 },
];

export const donutData = {
  bookings: [
    { name: 'Al Huda Arena', value: 80, color: '#4A7C59' },
    { name: 'Other Facilities', value: 20, color: '#E5E7EB' },
  ],
  revenue: [
    { name: 'Al Huda Arena', value: 133000, color: '#4A7C59' },
    { name: 'Other Facilities', value: 33000, color: '#E5E7EB' },
  ],
};

export const calendarSessions = [
  {
    id: '1',
    title: 'Bantafc Monthly',
    day: 'Monday',
    startTime: '2:00 AM',
    endTime: '4:00 AM',
    status: 'confirmed'
  },
  {
    id: '2', 
    title: 'Hasa Fc Monthly',
    day: 'Tuesday',
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    status: 'confirmed'
  },
  {
    id: '3',
    title: 'Training Session',
    day: 'Wednesday', 
    startTime: '6:00 AM',
    endTime: '8:00 AM',
    status: 'completed'
  },
  {
    id: '4',
    title: 'Youth Practice',
    day: 'Thursday',
    startTime: '4:00 AM',
    endTime: '6:00 AM', 
    status: 'confirmed'
  },
  {
    id: '5',
    title: 'Weekend Match',
    day: 'Saturday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    status: 'confirmed'
  }
];

export const sessionsData = [
  {
    id: 'IcrN55',
    bookedBy: 'HassFc',
    pitch: 'Al-Huda Arena',
    date: '6/9/2025',
    time: '8:00 AM - 10:00 AM',
    type: 'Monthly',
    amount: '-',
    status: 'Confirmed'
  },
  {
    id: 'BeR97c',
    bookedBy: 'talentofc', 
    pitch: 'Al-Huda Arena',
    date: '6/9/2025',
    time: '2:30 PM - 4:00 PM',
    type: 'Weekly',
    amount: '-',
    status: 'Confirmed'
  },
  {
    id: 'Xm8P4k',
    bookedBy: 'YouthFC',
    pitch: 'Al-Huda Arena',
    date: '7/9/2025',
    time: '6:00 AM - 8:00 AM',
    type: 'Weekly',
    amount: '2500',
    status: 'Confirmed'
  },
  {
    id: 'Qw2E5r',
    bookedBy: 'Champions',
    pitch: 'Al-Huda Arena', 
    date: '7/9/2025',
    time: '4:00 PM - 6:00 PM',
    type: 'Monthly',
    amount: '5000',
    status: 'Pending'
  }
];

export const groupsData = [
  {
    id: '1',
    name: 'walaalaha',
    pitch: 'Al Huda Arena',
    days: 'Sun',
    startTime: '8:00 PM',
    endTime: '10:00 PM',
    contribution: 15000,
    status: 'Approved',
    paymentType: 'Monthly'
  },
  {
    id: '2',
    name: 'talento fc',
    pitch: 'Al Huda Arena',
    days: 'Fri',
    startTime: '4:30 PM',
    endTime: '6:00 PM',
    contribution: 3750,
    status: 'Approved',
    paymentType: 'Weekly'
  },
  {
    id: '3',
    name: 'juventus fc',
    pitch: 'Al Huda Arena',
    days: 'Sat',
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    contribution: 7500,
    status: 'Approved',
    paymentType: 'Bi-weekly'
  },
  {
    id: '4',
    name: 'barcelona youth',
    pitch: 'Al Huda Arena',
    days: 'Wed',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    contribution: 5000,
    status: 'Approved',
    paymentType: 'Monthly'
  }
];

export const financesData = [
  {
    id: '1',
    date: '30/8/2025',
    type: 'Session Fee',
    sessionNo: 'wtTPB7',
    status: 'Successful',
    amount: 5000,
    newBalance: 172463,
    typeColor: 'green'
  },
  {
    id: '2',
    date: '30/8/2025',
    type: 'Withdrawal',
    sessionNo: null,
    status: 'Successful', 
    amount: 25000,
    newBalance: 167463,
    typeColor: 'red'
  },
  {
    id: '3',
    date: '29/8/2025',
    type: 'Session Fee',
    sessionNo: 'ABC123',
    status: 'Successful',
    amount: 3750,
    newBalance: 192463,
    typeColor: 'green'
  },
  {
    id: '4',
    date: '29/8/2025',
    type: 'Session Fee',
    sessionNo: 'DEF456',
    status: 'Successful',
    amount: 7500,
    newBalance: 188713,
    typeColor: 'green'
  },
  {
    id: '5',
    date: '28/8/2025',
    type: 'Withdrawal',
    sessionNo: null,
    status: 'Successful',
    amount: 15000,
    newBalance: 181213,
    typeColor: 'red'
  }
];