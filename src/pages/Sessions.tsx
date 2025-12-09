import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar, Eye, X, Loader2, Clock, User, MapPin, DollarSign } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useSessionsSearch, SessionSearchResult } from '../hooks/useSessionsSearch';
import { DetailPanel, DetailRow, DetailSection, StatusBadge } from '../components/ui/DetailPanel';

const Sessions: React.FC = () => {
  const { selectedOrgId, loading: orgLoading } = useOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSession, setSelectedSession] = useState<SessionSearchResult | null>(null);
  const itemsPerPage = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Convert string dates to Date objects
  const dateRange = useMemo(() => ({
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  }), [startDate, endDate]);

  const {
    sessions,
    loading: sessionsLoading,
    error,
    totalHits,
    totalPages,
    search
  } = useSessionsSearch({
    organizationId: selectedOrgId,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    page: currentPage,
    hitsPerPage: itemsPerPage
  });

  // Trigger search when debounced search term changes
  useEffect(() => {
    search(debouncedSearch);
  }, [debouncedSearch, search]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, startDate, endDate, selectedOrgId]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateLong = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const handleViewSession = (session: SessionSearchResult) => {
    setSelectedSession(session);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-success text-white';
      case 'Completed':
        return 'bg-primary text-white';
      case 'Pending':
      case 'Processing':
        return 'bg-warning text-white';
      case 'Cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const isLoading = orgLoading || sessionsLoading;
  const hasFilters = startDate || endDate || searchTerm;

  // Calculate display range
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalHits);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4">
          {/* Search - Full width on mobile, comes first */}
          <div className="relative w-full lg:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Date filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 pr-2 sm:pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 text-sm"
                    placeholder="Start Date"
                  />
                </div>
                <span className="text-gray-500 text-sm">to</span>
                <div className="relative flex-1 sm:flex-none">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="pl-10 pr-2 sm:pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 text-sm"
                    placeholder="End Date"
                  />
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
              )}
            </div>

            {/* Search - Hidden on mobile, shown on desktop */}
            <div className="relative hidden lg:block lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Booked by
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pitch
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-gray-500">Loading sessions...</span>
                    </div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {hasFilters
                      ? 'No sessions found matching your filters.'
                      : 'No sessions found for this organization.'}
                  </td>
                </tr>
              ) : (
                sessions.map((session, index) => (
                  <tr key={session.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-gray-700">{session.ownerDisplayName}</span>
                        {session.groupName && (
                          <span className="block text-xs text-gray-500">{session.groupName}</span>
                        )}
                        {/* Show pitch on mobile since column is hidden */}
                        <span className="block md:hidden text-xs text-gray-500">{session.pitchName}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-gray-700">{session.pitchName}</span>
                        <span className="block text-xs text-gray-500">{session.pitch}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(session.date)}</span>
                      {/* Show time on mobile since column is hidden */}
                      <span className="block sm:hidden text-xs text-gray-500">{session.time}</span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{session.time}</span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{session.type}</span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {session.pitchFee === 0 ? '-' : `Kshs ${session.pitchFee.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(session.status)}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewSession(session)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="View session details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalHits > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 order-2 sm:order-1">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalHits}</span> results
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage <= 2) {
                pageNum = i;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-white border-primary'
                      : 'text-gray-500 hover:text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Session Detail Panel */}
      <DetailPanel
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title="Session Details"
        subtitle={selectedSession?.sessionNo || selectedSession?.id.substring(0, 6)}
      >
        {selectedSession && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <StatusBadge status={selectedSession.status} />
              <span className="text-sm text-gray-500">{selectedSession.type}</span>
            </div>

            <DetailSection title="Booking Information">
              <DetailRow
                icon={<User className="w-5 h-5" />}
                label="Booked by"
                value={
                  <div>
                    <span>{selectedSession.ownerDisplayName}</span>
                    {selectedSession.groupName && (
                      <span className="block text-sm text-gray-500">{selectedSession.groupName}</span>
                    )}
                  </div>
                }
              />
              <DetailRow
                icon={<MapPin className="w-5 h-5" />}
                label="Pitch"
                value={
                  <div>
                    <span>{selectedSession.pitchName}</span>
                    <span className="block text-sm text-gray-500">{selectedSession.pitch}</span>
                  </div>
                }
              />
            </DetailSection>

            <DetailSection title="Schedule">
              <DetailRow
                icon={<Calendar className="w-5 h-5" />}
                label="Date"
                value={formatDateLong(selectedSession.date)}
              />
              <DetailRow
                icon={<Clock className="w-5 h-5" />}
                label="Time"
                value={selectedSession.time}
              />
            </DetailSection>

            <DetailSection title="Payment">
              <DetailRow
                icon={<DollarSign className="w-5 h-5" />}
                label="Pitch Fee"
                value={selectedSession.pitchFee === 0 ? '-' : `Kshs ${selectedSession.pitchFee.toLocaleString()}`}
              />
              <DetailRow
                icon={<DollarSign className="w-5 h-5" />}
                label="Collected Amount"
                value={selectedSession.collectedAmount === 0 ? '-' : `Kshs ${selectedSession.collectedAmount.toLocaleString()}`}
              />
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </div>
  );
};

export default Sessions;
