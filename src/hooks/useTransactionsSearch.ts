import { useState, useEffect, useCallback } from 'react';
import { algoliaClient, TRANSACTIONS_INDEX } from '../algolia/config';

export type TransactionType = 'Session2PitchWallet' | 'PitchWallet2Mpesa' | string;

export interface TransactionSearchResult {
  id: string;
  objectID: string;
  type: TransactionType;
  amount: number;
  transactionDate: Date;
  dateTimestamp: number;
  status: string;
  reference: string;
  description: string;
  sessionRef?: string;
  userRef?: string;
  userName?: string;
  pitchName?: string;
}

interface UseTransactionsSearchResult {
  transactions: TransactionSearchResult[];
  loading: boolean;
  error: string | null;
  totalHits: number;
  totalPages: number;
  search: (query: string) => void;
}

interface UseTransactionsSearchOptions {
  organizationId: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  page?: number;
  hitsPerPage?: number;
}

export const useTransactionsSearch = ({
  organizationId,
  startDate,
  endDate,
  page = 0,
  hitsPerPage = 20
}: UseTransactionsSearchOptions): UseTransactionsSearchResult => {
  const [transactions, setTransactions] = useState<TransactionSearchResult[]>([]);
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
      setTransactions([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build filters based on the original Flutter code
        const filters: string[] = [];

        // Add organization filter
        filters.push(`organization_ref:"organizations/${organizationId}"`);

        // Add type filter for transaction types
        filters.push('(type:"Session2PitchWallet" OR type:"PitchWallet2Mpesa")');

        // Add date range filters if provided
        if (startDate) {
          const startTimestamp = startDate.getTime();
          filters.push(`transaction_date >= ${startTimestamp}`);
        }

        if (endDate) {
          // End of day
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          const endTimestamp = endOfDay.getTime();
          filters.push(`transaction_date <= ${endTimestamp}`);
        }

        const filterString = filters.join(' AND ');

        console.log('🔍 [Algolia] Searching transactions:', {
          query: searchQuery,
          filters: filterString,
          page,
          hitsPerPage
        });

        const { results } = await algoliaClient!.searchForHits([
          {
            indexName: TRANSACTIONS_INDEX,
            query: searchQuery,
            filters: filterString,
            page,
            hitsPerPage
          }
        ]);

        const searchResult = results[0];

        if ('hits' in searchResult) {
          const hits = searchResult.hits as Array<Record<string, any>>;

          const transactionsData: TransactionSearchResult[] = hits.map((hit) => {
            // Parse transaction date (could be milliseconds or Firestore timestamp)
            let transactionDate = new Date();
            let dateTimestamp = 0;

            if (hit.transaction_date) {
              if (typeof hit.transaction_date === 'number') {
                dateTimestamp = hit.transaction_date;
                transactionDate = new Date(hit.transaction_date);
              } else if (hit.transaction_date._seconds) {
                dateTimestamp = hit.transaction_date._seconds * 1000;
                transactionDate = new Date(dateTimestamp);
              }
            } else if (hit.created_at) {
              if (typeof hit.created_at === 'number') {
                dateTimestamp = hit.created_at;
                transactionDate = new Date(hit.created_at);
              } else if (hit.created_at._seconds) {
                dateTimestamp = hit.created_at._seconds * 1000;
                transactionDate = new Date(dateTimestamp);
              }
            }

            return {
              id: hit.objectID,
              objectID: hit.objectID,
              type: hit.type || 'Unknown',
              amount: hit.amount ?? 0,
              transactionDate,
              dateTimestamp,
              status: hit.status || 'Completed',
              reference: hit.reference || hit.transaction_ref || '',
              description: hit.description || hit.narration || '',
              sessionRef: hit.session_ref || hit.sessionRef,
              userRef: hit.user_ref || hit.userRef,
              userName: hit.user_name || hit.userName || hit.owner_name || '',
              pitchName: hit.pitch_name || hit.pitchName || ''
            };
          });

          console.log('✅ [Algolia] Transaction results:', transactionsData.length, 'of', searchResult.nbHits);

          setTransactions(transactionsData);
          setTotalHits(searchResult.nbHits || 0);
          setTotalPages(searchResult.nbPages || 0);
        } else {
          setTransactions([]);
          setTotalHits(0);
          setTotalPages(0);
        }

        setLoading(false);
      } catch (err) {
        console.error('Algolia transaction search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoading(false);
      }
    };

    performSearch();
  }, [organizationId, startDate?.getTime(), endDate?.getTime(), searchQuery, page, hitsPerPage]);

  return {
    transactions,
    loading,
    error,
    totalHits,
    totalPages,
    search
  };
};
