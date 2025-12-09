import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import KPICard from '../components/ui/KPICard';
import {
  useDashboardData,
  useKPIData,
  useChartData
} from '../hooks/useDashboardData';
import { useOrganization } from '../contexts/OrganizationContext';
import { getCurrentMonthName } from '../utils/dateUtils';

// Dashboard Skeleton Component
const DashboardSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* KPI Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1 text-right ml-4">
              <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="w-32 h-6 bg-gray-200 rounded mb-6"></div>
          <div className="w-full h-80 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Error Component
const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-6">
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // Get organization from shared context
  const {
    selectedOrgId,
    loading: orgLoading,
    currentUser
  } = useOrganization();

  // 3-Level streaming architecture
  const { organization, pitches, stats, loading: dataLoading, error } = useDashboardData(selectedOrgId);

  // Process KPI data
  const kpiData = useKPIData(stats);

  // Process chart data
  const chartData = useChartData(stats, pitches);

  // Revenue chart tab state - must be before any conditional returns
  const [revenueTab, setRevenueTab] = useState<'collected' | 'expected'>('collected');

  const currentMonth = getCurrentMonthName();
  
  // Show authentication loading
  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="text-sm">Please log in to view dashboard data.</p>
        </div>
      </div>
    );
  }

  // Show organization selection loading
  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-gray-600">Selecting organization...</p>
        </div>
      </div>
    );
  }

  // Show no organization selected
  if (!selectedOrgId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="text-sm">No organization found. Please check your access permissions.</p>
        </div>
      </div>
    );
  }

  // Show data loading
  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  // Show no data state
  if (!kpiData) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
          <p className="text-sm">No data available for this organization.</p>
        </div>
      </div>
    );
  }

  // Create donut chart data from real stats
  const donutData = {
    bookings: [
      { name: 'Completed', value: Math.round(kpiData.monthlyBookings * 0.6), color: '#4A7C59' },
      { name: 'Pending', value: Math.round(kpiData.monthlyBookings * 0.25), color: '#F59E0B' },
      { name: 'Cancelled', value: Math.round(kpiData.monthlyBookings * 0.15), color: '#EF4444' },
    ].filter(item => item.value > 0), // Only show non-zero values
    revenue: [
      { name: 'Collected', value: kpiData.collectedRevenue, color: '#4A7C59' },
      { name: 'Pending', value: Math.max(0, kpiData.expectedRevenue - kpiData.collectedRevenue), color: '#F59E0B' },
    ].filter(item => item.value > 0) // Only show non-zero values
  };

  // Prepare chart data for Recharts
  const revenueChartData = chartData ? chartData.xValues.map((month, index) => ({
    month,
    value: chartData.datasets[0]?.data[index] || 0
  })) : [];

  const expectedRevenueChartData = chartData ? chartData.xValues.map((month, index) => ({
    month,
    value: chartData.datasets[2]?.data[index] || 0
  })) : [];

  const bookingsChartData = chartData ? chartData.xValues.map((month, index) => ({
    month,
    value: chartData.datasets[1]?.data[index] || 0
  })) : [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KPICard
          title={`${currentMonth} Bookings`}
          value={kpiData.monthlyBookings}
          icon={<Calendar className="w-8 h-8" />}
          bgColor="red"
        />
        <KPICard
          title="Collected Revenue"
          value={`Kshs ${kpiData.collectedRevenue.toLocaleString()}.00`}
          icon={<DollarSign className="w-8 h-8" />}
          bgColor="green"
        />
        <KPICard
          title="Expected Revenue"
          value={`Kshs ${kpiData.expectedRevenue.toLocaleString()}.00`}
          icon={<TrendingUp className="w-8 h-8" />}
          bgColor="blue"
        />
        <KPICard
          title="Avg Monthly Revenue"
          value={`Kshs ${Math.round(kpiData.avgMonthlyRevenue).toLocaleString()}`}
          icon={<BarChart3 className="w-8 h-8" />}
          bgColor="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Chart with Tabs */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">2025 Revenue</h3>
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRevenueTab('collected')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  revenueTab === 'collected'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Collected
              </button>
              <button
                onClick={() => setRevenueTab('expected')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  revenueTab === 'expected'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Expected
              </button>
            </div>
          </div>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTab === 'collected' ? revenueChartData : expectedRevenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value/1000}k`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4A7C59"
                  strokeWidth={3}
                  dot={{ fill: '#4A7C59', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#4A7C59' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">2025 Total Bookings</h3>
            <span className="text-xs sm:text-sm text-gray-500">Monthly Overview</span>
          </div>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4A7C59" 
                  fill="#4A7C59"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Donut Charts */}
      {(donutData.bookings.length > 0 || donutData.revenue.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Bookings Distribution */}
          {donutData.bookings.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Bookings Distribution</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData.bookings}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        {donutData.bookings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{kpiData.monthlyBookings}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none">{organization?.name || 'Total'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {donutData.bookings.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Distribution */}
          {donutData.revenue.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Revenue Distribution</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData.revenue}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        {donutData.revenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{Math.round(kpiData.collectedRevenue).toLocaleString()}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none">{organization?.name || 'Total'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {donutData.revenue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs sm:text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;