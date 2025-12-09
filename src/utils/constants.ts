// Route constants
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  CALENDAR: '/calendar',
  ANALYTICS: '/analytics',
  SESSIONS: '/sessions',
  GROUPS: '/groups',
  FINANCES: '/finances',
} as const;

// Color constants matching the design system
export const COLORS = {
  PRIMARY: '#4A7C59',
  SUCCESS: '#22C55E',
  DANGER: '#EF4444',
  WARNING: '#F97316',
  CARD_RED: 'rgba(254,226,226,1)',
  CARD_GREEN: 'rgba(220,252,231,1)',
  CARD_BLUE: 'rgba(219,234,254,1)',
  CARD_PURPLE: 'rgba(243,232,255,1)',
} as const;

// Layout constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 208,
  HEADER_HEIGHT: 64,
  CONTENT_PADDING: 24,
} as const;

// Firebase collection names
export const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  SESSIONS: 'sessions',
  PERMANENT_SESSIONS: 'PermanentSessions',
  SESSION_CALENDAR: 'sessionCalendar',
  TRANSACTIONS: 'transactions',
  CITIES: 'cities',
  LOGS: 'logs',
  WITHDRAWAL_REQUESTS: 'withdrawalRequests',
  TRANSACTION_COST: 'transactionCost',
  ORGANIZATION_STATS: 'organizationStats',
  INTERNAL_FUNDS_TRANSFER: 'internalFundsTransferStatus',
  // Subcollections
  PITCHES: 'pitches',
  WALLET: 'wallet',
  NOTIFICATIONS: 'notifications',
  CONTRIBUTIONS: 'Contributions',
  STATS: 'stats',
  MONTHLY_REPORTS: 'monthly_reports',
} as const;

// Status badges configuration
export const STATUS_BADGES = {
  CONFIRMED: { variant: 'success' as const, label: 'Confirmed' },
  PENDING: { variant: 'warning' as const, label: 'Pending' },
  CANCELLED: { variant: 'danger' as const, label: 'Cancelled' },
  COMPLETED: { variant: 'info' as const, label: 'Completed' },
  PROCESSING: { variant: 'warning' as const, label: 'Processing' },
  SUCCESSFUL: { variant: 'success' as const, label: 'Successful' },
  FAILED: { variant: 'danger' as const, label: 'Failed' },
  APPROVED: { variant: 'success' as const, label: 'Approved' },
  REJECTED: { variant: 'danger' as const, label: 'Rejected' },
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Date format constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  ISO: 'yyyy-MM-dd',
  TIME: 'hh:mm a',
} as const;