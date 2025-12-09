import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { SessionRecord, SessionStatus, SessionType } from '../types/calendar.types';

export interface SessionListItem {
  id: string;
  bookedBy: string;
  pitch: string;
  date: Date;
  time: string;
  type: SessionType;
  amount: number | null;
  status: SessionStatus;
  rawData: SessionRecord;
}

interface UseSessionsDataResult {
  sessions: SessionListItem[];
  loading: boolean;
  error: string | null;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PitchInfo {
  id: string;
  name: string;
}

const formatTime = (time: { hour: number; minute: number }): string => {
  const hour = time.hour % 12 || 12;
  const minute = time.minute.toString().padStart(2, '0');
  const period = time.hour >= 12 ? 'PM' : 'AM';
  return `${hour}:${minute} ${period}`;
};

const formatTimeRange = (sessionTime: { startTime: { hour: number; minute: number }; endTime: { hour: number; minute: number } }): string => {
  return `${formatTime(sessionTime.startTime)} - ${formatTime(sessionTime.endTime)}`;
};

export const useSessionsData = (
  organizationId: string | null,
  dateRange?: DateRange
): UseSessionsDataResult => {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setSessions([]);
      return;
    }

    console.log('📋 [Sessions] Setting up sessions stream for org:', organizationId);
    setLoading(true);
    setError(null);

    let sessionCalendarUnsubscribe: (() => void) | null = null;

    // First: Load pitches for this organization to filter sessions
    const pitchesQuery = query(
      collection(db, 'organizations', organizationId, 'pitches')
    );

    const pitchesUnsubscribe = onSnapshot(
      pitchesQuery,
      (pitchesSnapshot) => {
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

        console.log('🏟️ [Sessions] Pitches loaded:', pitchesData.length);

        if (pitchIds.length === 0) {
          setSessions([]);
          setLoading(false);
          return;
        }

        // Clean up previous session calendar listener if exists
        if (sessionCalendarUnsubscribe) {
          sessionCalendarUnsubscribe();
        }

        // Second: Load sessionCalendar and filter by organization's pitch IDs
        const sessionCalendarQuery = query(collection(db, 'sessionCalendar'));

        sessionCalendarUnsubscribe = onSnapshot(
          sessionCalendarQuery,
          async (snapshot) => {
            console.log('📋 [Sessions] SessionCalendar snapshot size:', snapshot.size);

            try {
              // First pass: collect entries only for this organization's pitches
              const allEntries: { entry: any; docId: string; pitchId: string; index: number }[] = [];
              const uniqueSessionIds = new Set<string>();

              for (const calendarDoc of snapshot.docs) {
                const data = calendarDoc.data();
                const docId = calendarDoc.id;
                const [pitchId] = docId.split(':');

                // Only process if pitch belongs to selected organization
                if (!pitchIds.includes(pitchId)) {
                  continue;
                }

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

              console.log('📋 [Sessions] Filtered entries for org:', allEntries.length, 'Unique sessions:', uniqueSessionIds.size);

              // Second pass: fetch all unique sessions in parallel
              const sessionCache: Map<string, any> = new Map();
              const sessionIdsArray = Array.from(uniqueSessionIds);

              // Fetch in batches of 50
              const batchSize = 50;
              for (let i = 0; i < sessionIdsArray.length; i += batchSize) {
                const batch = sessionIdsArray.slice(i, i + batchSize);
                const fetchPromises = batch.map(async (sessionId) => {
                  try {
                    const sessionDocRef = doc(db, 'sessions', sessionId);
                    const sessionDoc = await getDoc(sessionDocRef);
                    if (sessionDoc.exists()) {
                      sessionCache.set(sessionId, { ...sessionDoc.data(), id: sessionId });
                    }
                  } catch (err) {
                    console.error('Error fetching session:', sessionId, err);
                  }
                });
                await Promise.all(fetchPromises);
              }

              console.log('📋 [Sessions] Fetched session details:', sessionCache.size);

              // Third pass: build session list items
              const pitchNameMap = new Map(pitchesData.map(p => [p.id, p.name]));
              const sessionsData: SessionListItem[] = [];
              const processedSessionIds = new Set<string>();

              for (const { entry, docId, pitchId, index } of allEntries) {
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

                // Skip duplicates (same session may appear in multiple calendar entries)
                const uniqueKey = sessionId || `${docId}-${index}`;
                if (processedSessionIds.has(uniqueKey)) {
                  continue;
                }
                processedSessionIds.add(uniqueKey);

                // Parse session date
                let sessionDate: Date;
                const rawDate = entry.sessionDate;
                if (rawDate?.toDate) {
                  sessionDate = rawDate.toDate();
                } else if (rawDate instanceof Date) {
                  sessionDate = rawDate;
                } else if (rawDate) {
                  sessionDate = new Date(rawDate);
                } else {
                  sessionDate = new Date();
                }

                // Apply date range filter
                if (dateRange?.startDate && sessionDate < dateRange.startDate) {
                  continue;
                }
                if (dateRange?.endDate) {
                  const endOfDay = new Date(dateRange.endDate);
                  endOfDay.setHours(23, 59, 59, 999);
                  if (sessionDate > endOfDay) {
                    continue;
                  }
                }

                // Parse session time
                const startTimeRaw = entry.sessionTime?.startTime;
                const endTimeRaw = entry.sessionTime?.endTime;

                let startHour = 0, startMinute = 0, endHour = 1, endMinute = 0;

                if (startTimeRaw?.toDate) {
                  const startDate = startTimeRaw.toDate();
                  startHour = startDate.getHours();
                  startMinute = startDate.getMinutes();
                } else if (startTimeRaw instanceof Date) {
                  startHour = startTimeRaw.getHours();
                  startMinute = startTimeRaw.getMinutes();
                } else if (typeof startTimeRaw?.hour === 'number') {
                  startHour = startTimeRaw.hour;
                  startMinute = startTimeRaw.minute || 0;
                }

                if (endTimeRaw?.toDate) {
                  const endDate = endTimeRaw.toDate();
                  endHour = endDate.getHours();
                  endMinute = endDate.getMinutes();
                } else if (endTimeRaw instanceof Date) {
                  endHour = endTimeRaw.getHours();
                  endMinute = endTimeRaw.getMinutes();
                } else if (typeof endTimeRaw?.hour === 'number') {
                  endHour = endTimeRaw.hour;
                  endMinute = endTimeRaw.minute || 0;
                }

                const sessionTime = {
                  startTime: { hour: startHour, minute: startMinute },
                  endTime: { hour: endHour, minute: endMinute }
                };

                // Get session details from cache
                let ownerName = 'Unknown';
                let collectedAmount: number | null = null;
                let status: SessionStatus = (entry.status as SessionStatus) || 'Pending';
                let sessionType: SessionType = (entry.sessionType as SessionType) || 'Session';

                if (sessionId && sessionCache.has(sessionId)) {
                  const sessionData = sessionCache.get(sessionId);
                  ownerName = sessionData?.session_owner?.name || sessionData?.ownerName || 'Unknown';
                  collectedAmount = sessionData?.collected_amount ?? sessionData?.collectedAmount ?? null;
                  status = sessionData?.status || status;
                  sessionType = sessionData?.session_type || sessionData?.sessionType || sessionType;
                }

                const sessionItem: SessionListItem = {
                  id: sessionId || `${docId}-${index}`,
                  bookedBy: ownerName,
                  pitch: pitchNameMap.get(pitchId) || 'Unknown Pitch',
                  date: sessionDate,
                  time: formatTimeRange(sessionTime),
                  type: sessionType,
                  amount: collectedAmount,
                  status: status,
                  rawData: {
                    id: sessionId || `${docId}-${index}`,
                    sessionDate,
                    sessionTime,
                    sessionOwner: { name: ownerName, userRef: '' },
                    pitch: { pitchName: pitchNameMap.get(pitchId) || 'Unknown', organization_ref: organizationId },
                    sessionType,
                    status,
                    collectedAmount: collectedAmount ?? undefined,
                    reference: { id: sessionId || `${docId}-${index}` }
                  }
                };

                sessionsData.push(sessionItem);
              }

              // Sort by date (newest first)
              sessionsData.sort((a, b) => b.date.getTime() - a.date.getTime());

              console.log('✅ [Sessions] Processed sessions:', sessionsData.length);
              setSessions(sessionsData);
              setLoading(false);
            } catch (err) {
              console.error('Error processing sessions:', err);
              setError(err instanceof Error ? err.message : 'Failed to load sessions');
              setLoading(false);
            }
          },
          (err) => {
            console.error('Error fetching sessionCalendar:', err);
            setError(err.message || 'Failed to load sessions');
            setLoading(false);
          }
        );
      },
      (err) => {
        console.error('Error fetching pitches:', err);
        setError(err.message || 'Failed to load organization pitches');
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 [Sessions] Cleaning up sessions stream');
      pitchesUnsubscribe();
      if (sessionCalendarUnsubscribe) {
        sessionCalendarUnsubscribe();
      }
    };
  }, [organizationId, dateRange?.startDate?.getTime(), dateRange?.endDate?.getTime()]);

  return {
    sessions,
    loading,
    error
  };
};
