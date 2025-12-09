import React, { useState, useMemo, useEffect } from 'react';
import {
  Bookmark,
  DollarSign,
  TrendingUp,
  Percent,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useOrganizationSelection, useDashboardData, useKPIData, useChartData } from '../hooks/useDashboardData';
import { getCurrentMonthName } from '../utils/dateUtils';

// TypeScript Interfaces
interface Organization {
  id: string;
  name: string;
}

interface DashboardMetrics {
  monthlyBookings: number;
  collectedRevenue: number;
  expectedRevenue: number;
  avgMonthlyRevenue: number;
}

interface ChartDataPoint {
  month: string;
  value: number;
}

interface DashboardData {
  organization: Organization;
  metrics: DashboardMetrics;
  chartData: {
    revenues: ChartDataPoint[];
    bookings: ChartDataPoint[];
  };
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  borderColor: string;
}

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
  </div>
);

// Error Component
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    <p className="text-sm">{message}</p>
  </div>
);

// KPI Card Component
const KPICard: React.FC<KPICardProps> = ({ icon, label, value, bgColor, borderColor }) => {
  return (
    <div 
      className={`rounded-lg p-6 border-2 transition-all duration-200 hover:shadow-lg cursor-pointer`}
      style={{ 
        backgroundColor: bgColor,
        borderColor: borderColor
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0" style={{ color: borderColor }}>
          {icon}
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const PitchProDashboard: React.FC = () => {
  // Organization selection with polling
  const { selectedOrgId, loading: orgLoading } = useOrganizationSelection();
  
  // 3-Level streaming architecture  
  const { organization, pitches, stats, loading: dataLoading, error } = useDashboardData(selectedOrgId);
  
  // Process KPI data
  const kpiData = useKPIData(stats);
  
  // Process chart data
  const chartData = useChartData(stats, pitches);
  
  // Local state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `Kshs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  // Memoized KPI cards data
  const kpiCards = useMemo(() => {
    if (!kpiData) return [];
    
    const currentMonth = getCurrentMonthName();
    return [
      {
        icon: <Bookmark className="w-8 h-8" />,
        label: `${currentMonth} Bookings`,
        value: kpiData.monthlyBookings.toString(),
        bgColor: '#FF000410',
        borderColor: '#FF0004'
      },
      {
        icon: <DollarSign className="w-8 h-8" />,
        label: `${currentMonth} Collected Revenue`,
        value: formatCurrency(kpiData.collectedRevenue),
        bgColor: '#00943520',
        borderColor: '#009435'
      },
      {
        icon: <TrendingUp className="w-8 h-8" />,
        label: `${currentMonth} Expected Revenue`,
        value: formatCurrency(kpiData.expectedRevenue),
        bgColor: '#003BFF15',
        borderColor: '#003BFF'
      },
      {
        icon: <Percent className="w-8 h-8" />,
        label: 'Avg Monthly Revenue',
        value: formatCurrency(kpiData.avgMonthlyRevenue),
        bgColor: '#8B00FF15',
        borderColor: '#8B00FF'
      }
    ];
  }, [kpiData]);

  // Show loading state
  if (orgLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // Show no organization message
  if (!selectedOrgId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Found</h2>
          <p className="text-gray-600">You don't have access to any organizations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-52 bg-[#4A7C59] transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-4 border-b border-green-700">
            <h2 className="text-xl font-bold text-white">PitchPro Admin</h2>
          </div>

          {/* Organization Selector */}
          <div className="p-4">
            <div className="relative">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-between transition-colors"
              >
                <span className="text-sm truncate">{organization?.name || 'Select Organization'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* For now, show single organization - can be extended later for multi-org support */}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="block px-3 py-2 text-white hover:bg-green-600 rounded-lg transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="block px-3 py-2 text-white hover:bg-green-600 rounded-lg transition-colors">
                  Bookings
                </a>
              </li>
              <li>
                <a href="#" className="block px-3 py-2 text-white hover:bg-green-600 rounded-lg transition-colors">
                  Revenue
                </a>
              </li>
              <li>
                <a href="#" className="block px-3 py-2 text-white hover:bg-green-600 rounded-lg transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">{organization?.name || 'Dashboard'}</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:block relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Show metrics error */}
            {metricsError && (
              <div className="mb-6">
                <ErrorMessage message={metricsError} />
              </div>
            )}

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {metricsLoading ? (
                // Loading skeleton for cards
                [...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 text-right">
                        <div className="w-24 h-4 bg-gray-200 rounded mb-2 ml-auto"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded ml-auto"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                kpiCards.map((card, index) => (
                  <KPICard key={index} {...card} />
                ))
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Total Revenues</h3>
                {metricsLoading ? (
                  <div className="h-72 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData ? chartData.xValues.map((month, index) => ({
                    month,
                    value: chartData.datasets[0]?.data[index] || 0
                  })) : []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#666' }}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        tick={{ fill: '#666' }}
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4A7C59" 
                        strokeWidth={2}
                        dot={{ fill: '#4A7C59', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Bookings Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Total Bookings</h3>
                {metricsLoading ? (
                  <div className="h-72 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData ? chartData.xValues.map((month, index) => ({
                    month,
                    value: chartData.datasets[1]?.data[index] || 0
                  })) : []}>
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4A7C59" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month"
                        tick={{ fill: '#666' }}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        tick={{ fill: '#666' }}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4A7C59" 
                        strokeWidth={2}
                        fill="url(#colorBookings)"
                        name="Bookings"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PitchProDashboard;