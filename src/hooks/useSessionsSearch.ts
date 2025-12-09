import { useState, useEffect, useCallback } from 'react';
import { algoliaClient, SESSIONS_INDEX } from '../algolia/config';
import { SessionStatus, SessionType } from '../types/calendar.types';

export interface SessionSearchResult {
  id: string;
  objectID: string;
  sessionNo: string;
  bookedBy: string;
  ownerDisplayName: string;
  pitch: string;
  pitchName: string;
  organizationId: string;
  date: Date;
  dateTimestamp: number;
  time: string;
  type: SessionType;
  amount: number | null;
  collectedAmount: number;
  pitchFee: number;
  status: SessionStatus;
  groupName?: string;
}

interface UseSessionsSearchResult {
  sessions: SessionSearchResult[];
  loading: boolean;
  error: string | null;
  totalHits: number;
  totalPages: number;
  search: (query: string) => void;
}

interface UseSessionsSearchOptions {
  organizationId: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  page?: number;
  hitsPerPage?: number;
}

// Format time from milliseconds timestamp
const formatTimeFromTimestamp = (startMs: number, endMs: number): string => {
  const startDate = new Date(startMs);
  const endDate = new Date(endMs);

  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};

// Extract organization ID from organization_ref path
const extractOrgId = (orgRef: string): string => {
  // Format: "organizations/2FXgnS5SW6KqZX0BePTI"
  if (!orgRef) return '';
  const parts = orgRef.split('/');
  return parts.length > 1 ? parts[1] : orgRef;
};

export const useSessionsSearch = ({
  organizationId,
  startDate,
  endDate,
  page = 0,
  hitsPerPage = 20
}: UseSessionsSearchOptions): UseSessionsSearchResult => {
  const [sessions, setSessions] = useState<SessionSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalHits, setTotalHits] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (!algoliaClient) {
      setError('Algolia is not configured. Please set up your Algolia credentials.');
      setLoading(false);
      return;
    }

    if (!organizationId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build filters
        // Filter by organization using the pitch.organization_ref field
        const filters: string[] = [`pitch.organization_ref:organizations/${organizationId}`];

        // Add date range filters if provided (session_date is in milliseconds)
        if (startDate) {
          const startTimestamp = startDate.getTime();
          filters.push(`session_date >= ${startTimestamp}`);
        }

        if (endDate) {
          // End of day
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          const endTimestamp = endOfDay.getTime();
          filters.push(`session_date <= ${endTimestamp}`);
        }

        const filterString = filters.join(' AND ');

        console.log('🔍 [Algolia] Searching sessions:', {
          query: searchQuery,
          filters: filterString,
          page,
          hitsPerPage
        });

        const { results } = await algoliaClient!.searchForHits([
          {
            indexName: SESSIONS_INDEX,
            query: searchQuery,
            filters: filterString,
            page,
            hitsPerPage
          }
        ]);

        const searchResult = results[0];

        if ('hits' in searchResult) {
          const hits = searchResult.hits as Array<Record<string, any>>;

          const sessionsData: SessionSearchResult[] = hits.map((hit) => {
            // Parse session time
            const sessionTime = hit.session_time || {};
            const startTime = sessionTime.startTime || 0;
            const endTime = sessionTime.endTime || 0;
            const timeString = startTime && endTime
              ? formatTimeFromTimestamp(startTime, endTime)
              : '';

            // Parse session date (milliseconds)
            const sessionDateMs = hit.session_date || 0;
            const sessionDate = new Date(sessionDateMs);

            // Get owner info
            const sessionOwner = hit.session_owner || {};

            // Get pitch info
            const pitch = hit.pitch || {};

            return {
              id: hit.objectID,
              objectID: hit.objectID,
              sessionNo: hit.session_no || '',
              bookedBy: sessionOwner.name || 'Unknown',
              ownerDisplayName: sessionOwner.displayName || sessionOwner.name || 'Unknown',
              pitch: pitch.name || 'Unknown Venue',
              pitchName: pitch.pitchName || 'Unknown Pitch',
              organizationId: extractOrgId(pitch.organization_ref || ''),
              date: sessionDate,
              dateTimestamp: sessionDateMs,
              time: timeString,
              type: (hit.session_type as SessionType) || 'Session',
              amount: hit.pitch_fee ?? null,
              collectedAmount: hit.collected_amount ?? 0,
              pitchFee: hit.pitch_fee ?? 0,
              status: (hit.status as SessionStatus) || 'Pending',
              groupName: hit.group_name
            };
          });

          console.log('✅ [Algolia] Search results:', sessionsData.length, 'of', searchResult.nbHits);

          setSessions(sessionsData);
          setTotalHits(searchResult.nbHits || 0);
          setTotalPages(searchResult.nbPages || 0);
        } else {
          setSessions([]);
          setTotalHits(0);
          setTotalPages(0);
        }

        setLoading(false);
      } catch (err) {
        console.error('Algolia search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoading(false);
      }
    };

    performSearch();
  }, [organizationId, startDate?.getTime(), endDate?.getTime(), searchQuery, page, hitsPerPage]);

  return {
    sessions,
    loading,
    error,
    totalHits,
    totalPages,
    search
  };
};
