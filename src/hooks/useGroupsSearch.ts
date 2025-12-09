import { useState, useEffect, useCallback } from 'react';
import { algoliaClient, PERMANENT_SESSIONS_INDEX } from '../algolia/config';

export type GroupStatus = 'Approved' | 'Pending' | 'Rejected';
export type PaymentType = 'Monthly' | 'Weekly' | 'Bi-weekly';

export interface GroupMember {
  role: string;
  status: string;
  userDetails: {
    displayName: string;
    imagePath: string;
    name: string;
    phoneNumber: string;
    userRef: string;
  };
}

export interface GroupSearchResult {
  id: string;
  objectID: string;
  name: string;
  groupId: string;
  organizationId: string;
  pitchRef: string;
  days: string[];
  startTime: string;
  endTime: string;
  status: GroupStatus;
  paymentType: PaymentType;
  pricePerMember: number;
  pitchFee: number;
  totalPrice: number;
  percentageDiscount: number;
  members: GroupMember[];
  membersCount: number;
  adminName: string;
  startDate: Date;
  createdTime: Date;
}

interface UseGroupsSearchResult {
  groups: GroupSearchResult[];
  loading: boolean;
  error: string | null;
  totalHits: number;
  totalPages: number;
  search: (query: string) => void;
}

interface UseGroupsSearchOptions {
  organizationId: string | null;
  status?: GroupStatus | null;
  days?: string[] | null;
  page?: number;
  hitsPerPage?: number;
}

// Format time from milliseconds timestamp
const formatTimeFromTimestamp = (ms: number): string => {
  const date = new Date(ms);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Extract organization ID from organization_ref path
const extractOrgId = (orgRef: string): string => {
  if (!orgRef) return '';
  const parts = orgRef.split('/');
  return parts.length > 1 ? parts[1] : orgRef;
};

export const useGroupsSearch = ({
  organizationId,
  status,
  days,
  page = 0,
  hitsPerPage = 10
}: UseGroupsSearchOptions): UseGroupsSearchResult => {
  const [groups, setGroups] = useState<GroupSearchResult[]>([]);
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
      setGroups([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build filters
        const filters: string[] = [`organization_ref:organizations/${organizationId}`];

        // Add status filter if provided
        if (status) {
          filters.push(`status:${status}`);
        }

        // Add days filter if provided (filters groups that play on any of these days)
        if (days && days.length > 0) {
          // Use OR for multiple days: (session_time.days:Mon OR session_time.days:Tue)
          const daysFilter = days.map(d => `session_time.days:${d}`).join(' OR ');
          filters.push(`(${daysFilter})`);
        }

        const filterString = filters.join(' AND ');

        console.log('🔍 [Algolia] Searching groups:', {
          query: searchQuery,
          filters: filterString,
          page,
          hitsPerPage
        });

        const { results } = await algoliaClient!.searchForHits([
          {
            indexName: PERMANENT_SESSIONS_INDEX,
            query: searchQuery,
            filters: filterString,
            page,
            hitsPerPage
          }
        ]);

        const searchResult = results[0];

        if ('hits' in searchResult) {
          const hits = searchResult.hits as Array<Record<string, any>>;

          const groupsData: GroupSearchResult[] = hits.map((hit) => {
            // Parse session time
            const sessionTime = hit.session_time || {};
            const startTimeMs = sessionTime.startTime || 0;
            const endTimeMs = sessionTime.endTime || 0;
            const days = sessionTime.days || [];

            // Get admin from members
            const members = hit.members || [];
            const admin = members.find((m: GroupMember) => m.role === 'Admin');
            const adminName = admin?.userDetails?.displayName || admin?.userDetails?.name || 'Unknown';

            return {
              id: hit.objectID,
              objectID: hit.objectID,
              name: hit.name || 'Unknown Group',
              groupId: hit.group_id || '',
              organizationId: extractOrgId(hit.organization_ref || ''),
              pitchRef: hit.pitch_ref || '',
              days,
              startTime: startTimeMs ? formatTimeFromTimestamp(startTimeMs) : '',
              endTime: endTimeMs ? formatTimeFromTimestamp(endTimeMs) : '',
              status: (hit.status as GroupStatus) || 'Pending',
              paymentType: (hit.payment_type as PaymentType) || 'Monthly',
              pricePerMember: hit.price_per_member ?? 0,
              pitchFee: hit.pitch_fee ?? 0,
              totalPrice: hit.total_price_per_contribution ?? hit.pitch_fee ?? 0,
              percentageDiscount: hit.percentage_discount ?? 0,
              members,
              membersCount: members.length,
              adminName,
              startDate: new Date(hit.start_date || 0),
              createdTime: new Date(hit.created_time || 0)
            };
          });

          console.log('✅ [Algolia] Groups search results:', groupsData.length, 'of', searchResult.nbHits);

          setGroups(groupsData);
          setTotalHits(searchResult.nbHits || 0);
          setTotalPages(searchResult.nbPages || 0);
        } else {
          setGroups([]);
          setTotalHits(0);
          setTotalPages(0);
        }

        setLoading(false);
      } catch (err) {
        console.error('Algolia groups search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoading(false);
      }
    };

    performSearch();
  }, [organizationId, status, days?.join(','), searchQuery, page, hitsPerPage]);

  return {
    groups,
    loading,
    error,
    totalHits,
    totalPages,
    search
  };
};
