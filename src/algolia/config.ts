import { algoliasearch } from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY;

if (!appId || !searchApiKey) {
  console.warn('Algolia credentials not configured. Please set VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_API_KEY in your .env file.');
}

export const algoliaClient = appId && searchApiKey
  ? algoliasearch(appId, searchApiKey)
  : null;

// Index names
export const SESSIONS_INDEX = 'sessions';
export const PERMANENT_SESSIONS_INDEX = 'PermanentSessionsId';
export const TRANSACTIONS_INDEX = 'transactions';
