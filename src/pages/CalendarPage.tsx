/**
 * PitchPro Admin - Calendar Page
 * Displays weekly calendar view with session bookings
 * @author Ultron Systems
 * @version 1.0.0
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SyncfusionCalendarView } from '@/components/calendar/SyncfusionCalendarView';
import { EnhancedWeekNavigationControls } from '@/components/calendar/EnhancedWeekNavigationControls';
// Import Syncfusion CSS
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-buttons/styles/material.css';
import '@syncfusion/ej2-calendars/styles/material.css';
import '@syncfusion/ej2-dropdowns/styles/material.css';
import '@syncfusion/ej2-inputs/styles/material.css';
import '@syncfusion/ej2-navigations/styles/material.css';
import '@syncfusion/ej2-popups/styles/material.css';
import '@syncfusion/ej2-react-schedule/styles/material.css';
import { CalendarLoadingSkeleton } from '@/components/calendar/CalendarLoadingSkeleton';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { SessionRecord } from '@/types/calendar.types';
import { filterSessionsByWeek } from '@/utils/calendarTransformations';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import '@/styles/calendar.css';
import '@/styles/syncfusion-calendar.css';
import { useOrganization } from '@/contexts/OrganizationContext';
import { collection, query, onSnapshot, doc, getDoc, documentId, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface PitchInfo {
  id: string;
  name: string;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedOrgId, currentOrganization, loading: orgLoading } = useOrganization();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    selectedWeekStart,
    changeWeek,
    weekLabel,
    getWeekEnd,
    isCurrentWeek,
    goToToday
  } = useWeekNavigation();

  // Get the months needed for the selected week (could span 2 months)
  const getRequiredMonths = (weekStart: Date): { month: number; year: number }[] => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const months: { month: number; year: number }[] = [];
    const startMonth = weekStart.getMonth() + 1; // 1-indexed
    const startYear = weekStart.getFullYear();
    const endMonth = weekEnd.getMonth() + 1;
    const endYear = weekEnd.getFullYear();

    months.push({ month: startMonth, year: startYear });

    // If week spans two months, add the second month
    if (startMonth !== endMonth || startYear !== endYear) {
      months.push({ month: endMonth, year: endYear });
    }

    return months;
  };

  // Load organization pitches first, then load sessions for those pitches
  useEffect(() => {
    if (!selectedOrgId) {
      setIsLoading(false);
      setSessions([]);
      return;
    }

    setIsLoading(true);
    console.log('📅 [Calendar] Setting up streams for org:', selectedOrgId);

    let sessionCalendarUnsubscribes: (() => void)[] = [];

    // First: Load pitches for this organization
    const pitchesQuery = query(
      collection(db, 'organizations', selectedOrgId, 'pitches')
    );

    const pitchesUnsubscribe = onSnapshot(pitchesQuery, (pitchesSnapshot) => {
      const pitchesData: PitchInfo[] = [];
      const pitchIds: string[] = [];

      pitchesSnapshot.forEach(pitchDoc => {
        const pitchData = pitchDoc.data();
        pitchesData.push({
          id: pitchDoc.id,
          name: pitchData.name || `Pitch ${pitchDoc.id}`
        });
        pitchIds.push(pitchDoc.id);
      });

      console.log('🏟️ [Calendar] Pitches loaded for org:', pitchesData.length, pitchIds);

      if (pitchIds.length === 0) {
        setSessions([]);
        setIsLoading(false);
        return;
      }

      // Clean up previous session calendar listeners
      sessionCalendarUnsubscribes.forEach(unsub => unsub());
      sessionCalendarUnsubscribes = [];

      // Build document IDs for the required months: {pitchId}:{month}:{year}
      const requiredMonths = getRequiredMonths(selectedWeekStart);
      const targetDocIds: string[] = [];

      for (const pitchId of pitchIds) {
        for (const { month, year } of requiredMonths) {
          targetDocIds.push(`${pitchId}:${month}:${year}`);
        }
      }

      console.log('📅 [Calendar] Fetching specific docs:', targetDocIds.length, targetDocIds);

      // Query only the specific documents we need (max ~10 docs instead of 2000+)
      // Firestore 'in' query supports up to 30 values, which is plenty for 5 pitches * 2 months
      const sessionCalendarQuery = query(
        collection(db, 'sessionCalendar'),
        where(documentId(), 'in', targetDocIds)
      );

      const unsubscribe = onSnapshot(sessionCalendarQuery, async (snapshot) => {
        console.log('📅 [Calendar] SessionCalendar snapshot size:', snapshot.size);

        const allEntries: { entry: any; docId: string; pitchId: string; index: number }[] = [];
        const uniqueSessionIds = new Set<string>();
        const pitchNameMap = new Map(pitchesData.map(p => [p.id, p.name]));

        for (const calendarDoc of snapshot.docs) {
          const data = calendarDoc.data();
          const docId = calendarDoc.id;
          const [pitchId] = docId.split(':');

          const sessionEntries = data.session_entries || [];

          for (let i = 0; i < sessionEntries.length; i++) {
            const entry = sessionEntries[i];
            allEntries.push({ entry, docId, pitchId, index: i });

            // Extract session ID
            const sessionRefRaw = entry.sessionRef;
            if (sessionRefRaw) {
              let sessionId: string | null = null;
              if (typeof sessionRefRaw === 'string') {
                sessionId = sessionRefRaw.split('/').pop() || null;
              } else if (sessionRefRaw.id) {
                sessionId = sessionRefRaw.id;
              } else if (sessionRefRaw.path) {
                sessionId = sessionRefRaw.path.split('/').pop() || null;
              }
              if (sessionId) uniqueSessionIds.add(sessionId);
            }
          }
        }

        console.log('📅 [Calendar] Entries for org:', allEntries.length, 'Unique sessions:', uniqueSessionIds.size);

        // Fetch session details in parallel (all batches at once)
        const sessionCache: Map<string, any> = new Map();
        const sessionIdsArray = Array.from(uniqueSessionIds);

        const fetchPromises = sessionIdsArray.map(async (sessionId) => {
          try {
            const sessionDocRef = doc(db, 'sessions', sessionId);
            const sessionDoc = await getDoc(sessionDocRef);
            if (sessionDoc.exists()) {
              sessionCache.set(sessionId, sessionDoc.data());
            }
          } catch (err) {
            console.error('Error fetching session:', sessionId, err);
          }
        });
        await Promise.all(fetchPromises);

        console.log('📅 [Calendar] Fetched session details:', sessionCache.size);

        // Build session records
        const sessionsData: SessionRecord[] = [];

        for (const { entry, docId, pitchId, index } of allEntries) {
          const startTime = entry.sessionTime?.startTime?.toDate?.() || entry.sessionTime?.startTime;
          const endTime = entry.sessionTime?.endTime?.toDate?.() || entry.sessionTime?.endTime;
          const sessionDate = entry.sessionDate?.toDate?.() || entry.sessionDate;

          // Get session ID
          let sessionId: string | null = null;
          const sessionRefRaw = entry.sessionRef;
          if (sessionRefRaw) {
            if (typeof sessionRefRaw === 'string') {
              sessionId = sessionRefRaw.split('/').pop() || null;
            } else if (sessionRefRaw.id) {
              sessionId = sessionRefRaw.id;
            } else if (sessionRefRaw.path) {
              sessionId = sessionRefRaw.path.split('/').pop() || null;
            }
          }

          // Get owner name from cache
          let ownerName = 'Unknown';
          if (sessionId && sessionCache.has(sessionId)) {
            const sessionData = sessionCache.get(sessionId);
            ownerName = sessionData?.session_owner?.name || sessionData?.ownerName || 'Unknown';
          }

          const session: SessionRecord = {
            id: `${docId}-${index}`,
            sessionDate: sessionDate || new Date(),
            sessionTime: {
              startTime: {
                hour: startTime instanceof Date ? startTime.getHours() : 0,
                minute: startTime instanceof Date ? startTime.getMinutes() : 0
              },
              endTime: {
                hour: endTime instanceof Date ? endTime.getHours() : 0,
                minute: endTime instanceof Date ? endTime.getMinutes() : 0
              }
            },
            sessionOwner: {
              name: ownerName,
              userRef: sessionId || ''
            },
            pitch: {
              pitchName: entry.pitchName || pitchNameMap.get(pitchId) || pitchId,
              organization_ref: selectedOrgId
            },
            sessionType: entry.sessionType || 'Session',
            status: entry.status || 'Confirmed',
            collectedAmount: entry.collectedAmount || entry.collected_amount || 0,
            reference: { id: sessionId || `${docId}-${index}` }
          };

          sessionsData.push(session);
        }

        console.log('✅ [Calendar] Processed sessions for org:', sessionsData.length);
        setSessions(sessionsData);
        setIsLoading(false);
      }, (error) => {
        console.error('❌ [Calendar] Error fetching sessions:', error);
        setIsLoading(false);
      });

      sessionCalendarUnsubscribes.push(unsubscribe);
    }, (error) => {
      console.error('❌ [Calendar] Error fetching pitches:', error);
      setIsLoading(false);
    });

    return () => {
      console.log('🧹 [Calendar] Cleaning up streams');
      pitchesUnsubscribe();
      sessionCalendarUnsubscribes.forEach(unsub => unsub());
    };
  }, [selectedOrgId, selectedWeekStart]);

  // Filter sessions by week
  const weekFilteredSessions = useMemo(() => {
    return filterSessionsByWeek(
      sessions,
      selectedWeekStart,
      getWeekEnd()
    );
  }, [sessions, selectedWeekStart, getWeekEnd]);

  const handleSessionClick = (sessionId: string) => {
    // Navigate to SessionDetails page with the session ID
    navigate(`/session-details/${sessionId}`);
  };

  const handleCreateSession = () => {
    toast.success('Opening new session form');
    // In real Firebase app: navigate('/sessions/new');
    console.log('Create new session');
  };

  const refreshData = () => {
    toast.success('Refreshing calendar data...');
    // Data will auto-refresh via Firebase onSnapshot
  };


  if (isLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <CalendarLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!selectedOrgId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <p className="text-sm">Please select an organization to view the calendar.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="calendar-header">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentOrganization?.name || 'Calendar'}

              </h1>

              <Badge variant="outline" className="font-normal">
                {weekFilteredSessions.length} Sessions
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Real-time sports facility scheduling system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              className="relative"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Sessions</div>
            <div className="text-2xl font-bold text-gray-900">
              {weekFilteredSessions.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">This week</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-green-600">
              {weekFilteredSessions.filter((s: SessionRecord) => s.status === 'Confirmed').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active bookings</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-gray-600">
              {weekFilteredSessions.filter((s: SessionRecord) => s.status === 'Completed').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Finished sessions</div>
          </div>
        </div>


        {/* Week Navigation */}
        <EnhancedWeekNavigationControls
          weekLabel={weekLabel}
          onPrevious={() => changeWeek(-1)}
          onNext={() => changeWeek(1)}
          onToday={goToToday}
          isCurrentWeek={isCurrentWeek}
        />

        {/* Calendar View */}
        <SyncfusionCalendarView
          sessions={weekFilteredSessions}
          weekStart={selectedWeekStart}
          onSessionClick={handleSessionClick}
          onCreateSession={handleCreateSession}
        />

      </div>
    </div>
  );
};

export default CalendarPage;