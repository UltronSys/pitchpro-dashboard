import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Loader2, Users, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useGroupsSearch, GroupSearchResult } from '../hooks/useGroupsSearch';
import { DetailPanel, DetailRow, DetailSection, StatusBadge } from '../components/ui/DetailPanel';

const Groups: React.FC = () => {
  const { selectedOrgId, loading: orgLoading } = useOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<GroupSearchResult | null>(null);
  const itemsPerPage = 10;

  const allDays = [
    { value: 'Mon', label: 'Mon' },
    { value: 'Tue', label: 'Tue' },
    { value: 'Wed', label: 'Wed' },
    { value: 'Thur', label: 'Thur' },
    { value: 'Fri', label: 'Fri' },
    { value: 'Sat', label: 'Sat' },
    { value: 'Sun', label: 'Sun' }
  ];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    groups,
    loading: groupsLoading,
    error,
    totalHits,
    totalPages,
    search
  } = useGroupsSearch({
    organizationId: selectedOrgId,
    days: selectedDays.length > 0 ? selectedDays : null,
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
  }, [debouncedSearch, selectedDays, selectedOrgId]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDays([]);
  };

  const handleViewGroup = (group: GroupSearchResult) => {
    setSelectedGroup(group);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-success text-white';
      case 'Pending':
        return 'bg-warning text-white';
      case 'Rejected':
        return 'bg-danger text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const formatDays = (days: string[]): string => {
    if (!days || days.length === 0) return '-';
    return days.join(', ');
  };

  const isLoading = orgLoading || groupsLoading;
  const hasFilters = searchTerm || selectedDays.length > 0;

  // Calculate display range
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalHits);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Groups (Permanent Sessions)</h1>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Day filters */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            {allDays.map(day => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  selectedDays.includes(day.value)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.label}
              </button>
            ))}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ml-auto"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Group
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Days
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Members
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
                      <span className="text-gray-500">Loading groups...</span>
                    </div>
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {hasFilters
                      ? 'No groups found matching your filters.'
                      : 'No groups found for this organization.'}
                  </td>
                </tr>
              ) : (
                groups.map((group, index) => (
                  <tr key={group.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                        {/* Show admin on mobile */}
                        <span className="block md:hidden text-xs text-gray-500">{group.adminName}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{group.adminName}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDays(group.days)}</span>
                      {/* Show time on mobile */}
                      <span className="block sm:hidden text-xs text-gray-500">
                        {group.startTime} - {group.endTime}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {group.startTime} - {group.endTime}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-700">{group.membersCount}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {group.totalPrice > 0 ? `Kshs ${group.totalPrice.toLocaleString()}` : '-'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(group.status)}`}>
                        {group.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewGroup(group)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title="View group details"
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

      {/* Group Detail Panel */}
      <DetailPanel
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        title="Group Details"
        subtitle={selectedGroup?.name}
      >
        {selectedGroup && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <StatusBadge status={selectedGroup.status} />
              <span className="text-sm text-gray-500">{selectedGroup.paymentType}</span>
            </div>

            <DetailSection title="Group Information">
              <DetailRow
                icon={<Users className="w-5 h-5" />}
                label="Group Name"
                value={selectedGroup.name}
              />
              <DetailRow
                icon={<User className="w-5 h-5" />}
                label="Admin"
                value={selectedGroup.adminName}
              />
              <DetailRow
                icon={<Users className="w-5 h-5" />}
                label="Members"
                value={`${selectedGroup.membersCount} member${selectedGroup.membersCount !== 1 ? 's' : ''}`}
              />
            </DetailSection>

            <DetailSection title="Schedule">
              <DetailRow
                icon={<Calendar className="w-5 h-5" />}
                label="Days"
                value={formatDays(selectedGroup.days)}
              />
              <DetailRow
                icon={<Clock className="w-5 h-5" />}
                label="Time"
                value={`${selectedGroup.startTime} - ${selectedGroup.endTime}`}
              />
            </DetailSection>

            <DetailSection title="Payment">
              <DetailRow
                icon={<DollarSign className="w-5 h-5" />}
                label="Contribution"
                value={selectedGroup.totalPrice > 0 ? `Kshs ${selectedGroup.totalPrice.toLocaleString()}` : '-'}
              />
              <DetailRow
                icon={<DollarSign className="w-5 h-5" />}
                label="Pitch Fee"
                value={selectedGroup.pitchFee > 0 ? `Kshs ${selectedGroup.pitchFee.toLocaleString()}` : '-'}
              />
              {selectedGroup.percentageDiscount > 0 && (
                <DetailRow
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Discount"
                  value={`${selectedGroup.percentageDiscount}%`}
                />
              )}
            </DetailSection>

            {selectedGroup.members && selectedGroup.members.length > 0 && (
              <DetailSection title="Members List">
                <div className="space-y-2">
                  {selectedGroup.members.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        {member.userDetails?.imagePath ? (
                          <img
                            src={member.userDetails.imagePath}
                            alt={member.userDetails?.displayName || member.userDetails?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.userDetails?.displayName || member.userDetails?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}
          </>
        )}
      </DetailPanel>

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
    </div>
  );
};

export default Groups;
