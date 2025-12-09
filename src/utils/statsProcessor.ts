import { DateRangeStruct, StatsRecord, StatsStruct, LineGraphDataStruct, PitchData } from '../types/dashboard';
import { isDateInRange, getMonthNames } from './dateUtils';

// Core data processing function that aggregates stats
export const getFilteredStats = (dateRange: DateRangeStruct, statsRecords: StatsRecord[]): StatsStruct => {
  console.log('🔍 getFilteredStats called with:');
  console.log('📅 Date range:', dateRange);
  console.log('📊 Stats records:', statsRecords.length);
  
  let totalAmountCollected = 0;
  let totalNoOfSessions = 0;
  let totalAmountExpected = 0;
  
  let processedDays = 0;
  let daysInRange = 0;

  // Iterate through each pitch's stats
  for (const stat of statsRecords) {
    console.log('📊 Processing stats record:', stat.id, 'with', stat.days_stats.length, 'day stats');
    
    // Each stat has daysStats array with daily aggregations
    for (const dayStat of stat.days_stats) {
      processedDays++;
      const dayDate = dayStat.date;
      
      console.log(`📅 Day stat ${processedDays}:`, {
        date: dayDate,
        totalNoOfSessions: dayStat.totalNoOfSessions,
        totalAmountCollected: dayStat.totalAmountCollected,
        expectedAmount: dayStat.expectedAmount
      });
      
      // Check if day falls within date range
      const withinRange = isDateInRange(dayDate, dateRange.startDate, dateRange.endDate);
      
      console.log(`📅 Date ${dayDate.toISOString()} within range?`, withinRange);
      
      if (withinRange) {
        daysInRange++;
        totalAmountCollected += dayStat.totalAmountCollected || 0;
        totalNoOfSessions += dayStat.totalNoOfSessions || 0;
        totalAmountExpected += dayStat.expectedAmount || 0;
        
        console.log(`✅ Added to totals: sessions=${dayStat.totalNoOfSessions}, collected=${dayStat.totalAmountCollected}`);
      }
    }
  }
  
  const result = {
    totalAmountCollected,
    totalNoOfSessions,
    totalAmountExpected
  };
  
  console.log(`📊 getFilteredStats result: ${processedDays} days processed, ${daysInRange} in range`);
  console.log('✅ Final result:', result);

  return result;
};

// Average monthly revenue calculation
export const getAvgMonthlyRevenue = (dateRange: DateRangeStruct, statsRecords: StatsRecord[]): number => {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  
  let totalRevenue = 0;
  const uniqueMonths = new Set<string>();
  
  for (const stats of statsRecords) {
    for (const day of stats.days_stats) {
      const monthKey = `${day.date.getFullYear()}-${day.date.getMonth() + 1}`;
      
      // Exclude current month (partial data)
      if (monthKey === currentMonthKey) continue;
      
      // Check if within date range
      if (isDateInRange(day.date, dateRange.startDate, dateRange.endDate)) {
        totalRevenue += day.totalAmountCollected || 0;
        uniqueMonths.add(monthKey);
      }
    }
  }
  
  return uniqueMonths.size > 0 ? totalRevenue / uniqueMonths.size : 0;
};

// Generate X-axis values for charts
export const generateXValues = (dateRange: DateRangeStruct): string[] => {
  // For yearly view, return month names
  if (dateRange.type === 'Yearly') {
    return getMonthNames();
  }
  
  // Add daily, weekly logic as needed
  // For now, default to monthly
  return getMonthNames();
};

// Generate Y-axis data for charts
export const getYAxisValues = (
  dateRange: DateRangeStruct,
  statsRecords: StatsRecord[],
  pitchesRecords: PitchData[],
  showRevenue: boolean
): LineGraphDataStruct[] => {
  const datasets: LineGraphDataStruct[] = [];

  // Group data by pitch
  for (const pitch of pitchesRecords) {
    const pitchStats = statsRecords.filter(s => s.pitch_ref === pitch.id);
    const monthlyData = new Array(12).fill(0);

    // Aggregate by month
    for (const stat of pitchStats) {
      for (const day of stat.days_stats) {
        // Check if within date range
        if (!isDateInRange(day.date, dateRange.startDate, dateRange.endDate)) {
          continue;
        }

        const month = day.date.getMonth();
        if (showRevenue) {
          monthlyData[month] += day.totalAmountCollected || 0;
        } else {
          monthlyData[month] += day.totalNoOfSessions || 0;
        }
      }
    }

    datasets.push({
      name: pitch.name,
      data: monthlyData,
      color: pitch.color || generatePitchColor(pitch.id)
    });
  }

  return datasets;
};

// Generate Y-axis data for expected revenue
export const getExpectedRevenueValues = (
  dateRange: DateRangeStruct,
  statsRecords: StatsRecord[],
  pitchesRecords: PitchData[]
): LineGraphDataStruct[] => {
  const datasets: LineGraphDataStruct[] = [];

  // Group data by pitch
  for (const pitch of pitchesRecords) {
    const pitchStats = statsRecords.filter(s => s.pitch_ref === pitch.id);
    const monthlyData = new Array(12).fill(0);

    // Aggregate by month
    for (const stat of pitchStats) {
      for (const day of stat.days_stats) {
        // Check if within date range
        if (!isDateInRange(day.date, dateRange.startDate, dateRange.endDate)) {
          continue;
        }

        const month = day.date.getMonth();
        monthlyData[month] += day.expectedAmount || 0;
      }
    }

    datasets.push({
      name: pitch.name,
      data: monthlyData,
      color: pitch.color || generatePitchColor(pitch.id)
    });
  }

  return datasets;
};

// Generate colors for pitches
export const generatePitchColor = (pitchId: string): string => {
  const colors = [
    '#4A7C59', // Primary green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#10B981', // Emerald
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];
  
  // Simple hash function to assign consistent colors
  let hash = 0;
  for (let i = 0; i < pitchId.length; i++) {
    hash = pitchId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Convert Recharts format
export const convertToRechartsData = (
  xValues: string[],
  datasets: LineGraphDataStruct[]
): any[] => {
  return xValues.map((month, index) => {
    const dataPoint: any = { month };
    
    // Add data from each dataset
    datasets.forEach(dataset => {
      dataPoint[dataset.name] = dataset.data[index] || 0;
    });
    
    return dataPoint;
  });
};

// Get total values for a specific metric
export const getTotalValue = (datasets: LineGraphDataStruct[]): number[] => {
  const monthlyTotals = new Array(12).fill(0);
  
  datasets.forEach(dataset => {
    dataset.data.forEach((value, index) => {
      monthlyTotals[index] += value;
    });
  });
  
  return monthlyTotals;
};