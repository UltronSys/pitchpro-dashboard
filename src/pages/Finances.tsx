import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Calendar, X, Loader2 } from 'lucide-react';
import { useOrganization } from '../contexts/OrganizationContext';
import { useTransactionsSearch, TransactionSearchResult } from '../hooks/useTransactionsSearch';
import { DetailPanel, DetailRow, DetailSection, StatusBadge } from '../components/ui/DetailPanel';

const Finances: React.FC = () => {
  const { selectedOrgId, loading: orgLoading } = useOrganization();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSearchResult | null>(null);
  const itemsPerPage = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Convert string dates to Date objects
  const dateRange = {
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null
  };

  const {
    transactions,
    loading: transactionsLoading,
    error,
    totalHits,
    totalPages,
    search
  } = useTransactionsSearch({
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

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case 'Session2PitchWallet':
        return 'Session Fee';
      case 'PitchWallet2Mpesa':
        return 'Withdrawal';
      default:
        return type;
    }
  };

  const isIncome = (type: string): boolean => {
    return type === 'Session2PitchWallet';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Success':
        return 'bg-success text-white';
      case 'Pending':
      case 'Processing':
        return 'bg-warning text-white';
      case 'Failed':
      case 'Cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const isLoading = orgLoading || transactionsLoading;
  const hasFilters = startDate || endDate || searchTerm;

  // Calculate display range
  const startItem = totalHits > 0 ? currentPage * itemsPerPage + 1 : 0;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalHits);

  // Calculate totals from current transactions (this is approximate - ideally would come from API)
  const totalIncome = transactions
    .filter(t => isIncome(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => !isIncome(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Finances</h1>
        <p className="text-sm text-gray-600 mt-1">Track all financial transactions</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{totalHits}</p>
            </div>
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Income (This Page)</p>
              <p className="text-xl sm:text-2xl font-bold text-success mt-1 sm:mt-2">
                Kshs {totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-success/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Withdrawals (This Page)</p>
              <p className="text-xl sm:text-2xl font-bold text-danger mt-1 sm:mt-2">
                Kshs {totalWithdrawals.toLocaleString()}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-danger/10 rounded-lg">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-danger" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4">
          {/* Search - Full width on mobile */}
          <div className="relative w-full lg:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
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

            {/* Search - Hidden on mobile */}
            <div className="relative hidden lg:block lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
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

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-gray-500">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {hasFilters
                      ? 'No transactions found matching your filters.'
                      : 'No transactions found for this organization.'}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 cursor-pointer transition-colors`}
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(transaction.transactionDate)}</span>
                      {/* Show user on mobile */}
                      <span className="block sm:hidden text-xs text-gray-500">{transaction.userName || '-'}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {isIncome(transaction.type) ? (
                          <TrendingUp className="w-4 h-4 text-success mr-1 sm:mr-2" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-danger mr-1 sm:mr-2" />
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isIncome(transaction.type)
                            ? 'bg-success text-white'
                            : 'bg-danger text-white'
                        }`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-mono">
                        {transaction.reference || transaction.id.substring(0, 8)}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {transaction.userName || '-'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        isIncome(transaction.type) ? 'text-success' : 'text-danger'
                      }`}>
                        {isIncome(transaction.type) ? '+' : '-'}Kshs {transaction.amount.toLocaleString()}
                      </span>
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

      {/* Transaction Detail Panel */}
      <DetailPanel
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        subtitle={selectedTransaction?.reference || selectedTransaction?.id.substring(0, 8)}
      >
        {selectedTransaction && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <StatusBadge status={selectedTransaction.status} />
              <span className={`text-lg font-bold ${
                isIncome(selectedTransaction.type) ? 'text-success' : 'text-danger'
              }`}>
                {isIncome(selectedTransaction.type) ? '+' : '-'}Kshs {selectedTransaction.amount.toLocaleString()}
              </span>
            </div>

            <DetailSection title="Transaction Information">
              <DetailRow
                icon={<TrendingUp className="w-5 h-5" />}
                label="Type"
                value={
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    isIncome(selectedTransaction.type)
                      ? 'bg-success text-white'
                      : 'bg-danger text-white'
                  }`}>
                    {getTransactionTypeLabel(selectedTransaction.type)}
                  </span>
                }
              />
              <DetailRow
                icon={<Calendar className="w-5 h-5" />}
                label="Date"
                value={formatDateLong(selectedTransaction.transactionDate)}
              />
              {selectedTransaction.userName && (
                <DetailRow
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="User"
                  value={selectedTransaction.userName}
                />
              )}
              {selectedTransaction.pitchName && (
                <DetailRow
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Pitch"
                  value={selectedTransaction.pitchName}
                />
              )}
            </DetailSection>

            {selectedTransaction.description && (
              <DetailSection title="Description">
                <p className="text-sm text-gray-700">{selectedTransaction.description}</p>
              </DetailSection>
            )}

            <DetailSection title="Reference">
              <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                {selectedTransaction.id}
              </code>
            </DetailSection>
          </>
        )}
      </DetailPanel>
    </div>
  );
};

export default Finances;
