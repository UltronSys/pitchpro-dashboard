// TypeScript interfaces for dashboard data structure

export enum Days {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday'
}

export interface DayStatStruct {
  date: Date;
  totalAmountCollected: number;
  totalNoOfSessions: number;
  expectedAmount: number;
  day: Days;
}

export interface StatsRecord {
  id: string;
  start_date: Date;
  end_date: Date;
  pitch_ref: string;
  days_stats: DayStatStruct[];
}

export interface DateRangeStruct {
  type: 'All' | 'Yearly' | 'Monthly' | 'Weekly';
  startDate: Date | null;
  endDate: Date | null;
}

export interface StatsStruct {
  totalAmountCollected: number;
  totalNoOfSessions: number;
  totalAmountExpected: number;
}

export interface LineGraphDataStruct {
  name: string;
  data: number[];
  color: string;
}

export interface OrganizationData {
  id: string;
  name: string;
  ref?: any;
}

export interface PitchData {
  id: string;
  name: string;
  organizationId: string;
  color?: string;
}

export interface KPIData {
  monthlyBookings: number;
  collectedRevenue: number;
  expectedRevenue: number;
  avgMonthlyRevenue: number;
}

export interface ChartData {
  xValues: string[];
  datasets: LineGraphDataStruct[];
}

export interface DashboardData {
  organization: OrganizationData | null;
  pitches: PitchData[];
  stats: StatsRecord[];
  loading: boolean;
  error: string | null;
}