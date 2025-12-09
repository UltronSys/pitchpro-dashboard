import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDocs, 
  orderBy, 
  where,
  DocumentReference 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import authService from '../services/authService';
import { 
  OrganizationData, 
  PitchData, 
  StatsRecord, 
  DashboardData, 
  KPIData,
  ChartData,
  DayStatStruct 
} from '../types/dashboard';
import {
  getFilteredStats,
  getAvgMonthlyRevenue,
  getYAxisValues,
  getExpectedRevenueValues,
  generateXValues,
  convertToRechartsData,
  getTotalValue
} from '../utils/statsProcessor';
import { 
  getCurrentMonthRange, 
  getCurrentYearRange 
} from '../utils/dateUtils';

// Organization selection hook with polling and switching support
export const useOrganizationSelection = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [availableOrganizations, setAvailableOrganizations] = useState<OrganizationData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user: any) => {
      console.log('🔐 Auth state changed:', user?.email || 'No user');
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch organizations when user is authenticated
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      return;
    }

    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    // Fetch user organizations
    const fetchOrganizations = async () => {
      try {
        console.log('📋 Fetching organizations for:', currentUser.email);
        const userQuery = query(
          collection(db, 'users'),
          where('email', '==', currentUser.email)
        );

        const userSnapshot = await getDocs(userQuery);
        console.log('👤 User docs found:', userSnapshot.size);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const userOrgs = userData.organizations_list || [];
          console.log('🏢 Organizations list:', userOrgs);

          // Process organizations
          const processedOrgs: OrganizationData[] = [];

          for (const orgRef of userOrgs) {
            if (orgRef.ref) {
              try {
                const orgDoc = await orgRef.ref.get();
                if (orgDoc.exists) {
                  const orgData = orgDoc.data();
                  processedOrgs.push({
                    id: orgDoc.id,
                    name: orgData.name || 'Unknown Organization',
                    ref: orgRef.ref
                  });
                }
              } catch (error) {
                console.error('Error fetching organization:', error);
                // Fallback to using ref path
                const orgId = orgRef.ref.id || orgRef.ref.path?.split('/').pop();
                if (orgId) {
                  processedOrgs.push({
                    id: orgId,
                    name: orgRef.name || `Organization ${orgId}`,
                    ref: orgRef.ref
                  });
                }
              }
            }
          }

          console.log('✅ Processed organizations:', processedOrgs);
          setAvailableOrganizations(processedOrgs);

          // Auto-select first organization if none selected
          if (processedOrgs.length > 0 && !selectedOrgId) {
            setSelectedOrgId(processedOrgs[0].id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [authLoading, currentUser, selectedOrgId]);

  return {
    selectedOrgId,
    setSelectedOrgId,
    availableOrganizations,
    loading: loading || authLoading,
    currentUser
  };
};

// 3-Level Streaming Architecture Hook
export const useDashboardData = (organizationId: string | null): DashboardData => {
  // Level 1 - Organization Stream
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  
  // Level 2 - Pitches Stream  
  const [pitches, setPitches] = useState<PitchData[]>([]);
  
  // Level 3 - Stats Stream
  const [stats, setStats] = useState<StatsRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up 3-level data streams for org:', organizationId);
    
    let orgUnsubscribe: (() => void) | undefined;
    let pitchesUnsubscribe: (() => void) | undefined;
    let statsUnsubscribe: (() => void) | undefined;

    const setupStreams = async () => {
      try {
        // Level 1: Organization Stream
        console.log('📄 Level 1: Setting up organization stream');
        const orgRef = doc(db, 'organizations', organizationId);
        orgUnsubscribe = onSnapshot(orgRef, (orgDoc) => {
          if (orgDoc.exists()) {
            const orgData = orgDoc.data();
            setOrganization({
              id: orgDoc.id,
              name: orgData.name,
              ref: orgRef
            });
            console.log('✅ Level 1: Organization loaded:', orgData.name);
          } else {
            console.log('❌ Level 1: Organization not found');
            setError('Organization not found');
          }
        });

        // Level 2: Pitches Stream
        console.log('🏟️ Level 2: Setting up pitches stream');
        const pitchesQuery = query(
          collection(db, 'organizations', organizationId, 'pitches')
        );
        
        pitchesUnsubscribe = onSnapshot(pitchesQuery, (pitchesSnapshot) => {
          const pitchesData: PitchData[] = [];
          
          pitchesSnapshot.forEach(pitchDoc => {
            const pitchData = pitchDoc.data();
            pitchesData.push({
              id: pitchDoc.id,
              name: pitchData.name || `Pitch ${pitchDoc.id}`,
              organizationId: organizationId,
              color: pitchData.color
            });
          });
          
          setPitches(pitchesData);
          console.log('✅ Level 2: Pitches loaded:', pitchesData.length);
        });

        // Level 3: Stats Stream (Real-time)
        console.log('📊 Level 3: Setting up stats stream');
        const statsQuery = query(
          collection(db, 'organizationStats', organizationId, 'stats'),
          orderBy('start_date', 'desc')
        );
        
        statsUnsubscribe = onSnapshot(statsQuery, (statsSnapshot) => {
          const statsData: StatsRecord[] = [];

          console.log('📊 Level 3: Raw stats snapshot size:', statsSnapshot.size);

          statsSnapshot.forEach(statsDoc => {
            const data = statsDoc.data();
            console.log('📊 Raw stats document:', statsDoc.id, data);

            // Handle both formats:
            // 1. Document-level stats (total_amount_collected, total_no_of_sessions)
            // 2. days_stats array format

            let daysStats: DayStatStruct[] = [];

            if (data.days_stats && Array.isArray(data.days_stats)) {
              // Format 1: days_stats array exists
              daysStats = data.days_stats.map((day: any, index: number) => {
                console.log(`📅 Processing day stat ${index}:`, day);
                return {
                  date: day.date?.toDate() || new Date(),
                  // Handle both camelCase and snake_case field names
                  totalAmountCollected: day.totalAmountCollected || day.total_amount_collected || 0,
                  totalNoOfSessions: day.totalNoOfSessions || day.total_no_of_sessions || 0,
                  expectedAmount: day.expectedAmount || day.expected_amount || 0,
                  day: day.day
                };
              });
            } else if (data.total_amount_collected !== undefined || data.total_no_of_sessions !== undefined) {
              // Format 2: Document-level stats (no days_stats array)
              // Create a single day stat from document-level fields
              daysStats = [{
                date: data.start_date?.toDate() || new Date(),
                totalAmountCollected: data.total_amount_collected || 0,
                totalNoOfSessions: data.total_no_of_sessions || 0,
                expectedAmount: data.expected_amount || data.total_amount_collected || 0,
                day: undefined as any
              }];
              console.log('📅 Created day stat from document-level fields:', daysStats[0]);
            }

            const statsRecord = {
              id: statsDoc.id,
              start_date: data.start_date?.toDate() || new Date(),
              end_date: data.end_date?.toDate() || new Date(),
              pitch_ref: data.pitch_ref?.id || data.pitch_ref || '',
              days_stats: daysStats
            };

            console.log('📊 Processed stats record:', statsRecord);
            statsData.push(statsRecord);
          });

          setStats(statsData);
          console.log('✅ Level 3: Final processed stats:', statsData);
          console.log('📊 Total stats records:', statsData.length);
          console.log('📊 Total day stats across all records:',
            statsData.reduce((sum, record) => sum + record.days_stats.length, 0));
          setLoading(false);
        });

      } catch (err) {
        console.error('Error setting up data streams:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    setupStreams();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up data streams');
      if (orgUnsubscribe) orgUnsubscribe();
      if (pitchesUnsubscribe) pitchesUnsubscribe();
      if (statsUnsubscribe) statsUnsubscribe();
    };
  }, [organizationId]);

  return {
    organization,
    pitches,
    stats,
    loading,
    error
  };
};

// KPI Data Processing Hook
export const useKPIData = (stats: StatsRecord[]): KPIData | null => {
  return useMemo(() => {
    console.log('🔍 KPI Processing - Input stats:', stats);
    
    if (!stats || stats.length === 0) {
      console.log('❌ KPI Processing - No stats available');
      return {
        monthlyBookings: 0,
        collectedRevenue: 0,
        expectedRevenue: 0,
        avgMonthlyRevenue: 0
      };
    }

    console.log('📊 Processing KPI data from', stats.length, 'stats records');

    const currentMonthRange = getCurrentMonthRange();
    const currentYearRange = getCurrentYearRange();
    
    console.log('📅 Current month range:', currentMonthRange);
    console.log('📅 Current year range:', currentYearRange);

    // Calculate KPIs using processing functions
    const monthlyStats = getFilteredStats(currentMonthRange, stats);
    const avgRevenue = getAvgMonthlyRevenue(currentYearRange, stats);

    console.log('📊 Monthly stats result:', monthlyStats);
    console.log('💰 Average revenue result:', avgRevenue);

    const kpiData = {
      monthlyBookings: monthlyStats.totalNoOfSessions,
      collectedRevenue: monthlyStats.totalAmountCollected,
      expectedRevenue: monthlyStats.totalAmountExpected,
      avgMonthlyRevenue: avgRevenue
    };

    console.log('✅ Final KPI data:', kpiData);
    return kpiData;
  }, [stats]);
};

// Chart Data Processing Hook
export const useChartData = (stats: StatsRecord[], pitches: PitchData[]): ChartData | null => {
  return useMemo(() => {
    if (!stats || stats.length === 0 || !pitches || pitches.length === 0) {
      return null;
    }

    console.log('📈 Processing chart data from', stats.length, 'stats and', pitches.length, 'pitches');

    const currentYearRange = getCurrentYearRange();

    // Generate X-axis values (months)
    const xValues = generateXValues(currentYearRange);

    // Generate Y-axis datasets
    const revenueDatasets = getYAxisValues(currentYearRange, stats, pitches, true);
    const bookingsDatasets = getYAxisValues(currentYearRange, stats, pitches, false);
    const expectedRevenueDatasets = getExpectedRevenueValues(currentYearRange, stats, pitches);

    // Get total values (aggregate all pitches)
    const revenueTotals = getTotalValue(revenueDatasets);
    const bookingsTotals = getTotalValue(bookingsDatasets);
    const expectedRevenueTotals = getTotalValue(expectedRevenueDatasets);

    // Convert to Recharts format
    const revenueData = xValues.map((month, index) => ({
      month,
      value: revenueTotals[index]
    }));

    const bookingsData = xValues.map((month, index) => ({
      month,
      value: bookingsTotals[index]
    }));

    const chartData = {
      xValues,
      datasets: [
        {
          name: 'Total Revenue',
          data: revenueTotals,
          color: '#4A7C59'
        },
        {
          name: 'Total Bookings',
          data: bookingsTotals,
          color: '#4A7C59'
        },
        {
          name: 'Expected Revenue',
          data: expectedRevenueTotals,
          color: '#3B82F6'
        }
      ]
    };

    console.log('✅ Chart data processed');
    return chartData;
  }, [stats, pitches]);
};