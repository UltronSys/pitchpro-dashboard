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

// TypeScript Interfaces
interface Organization {
  id: string;
  name: string;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  borderColor: string;
}

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

// Main Dashboard Component with MOCK DATA
const PitchProDashboardSimple: React.FC = () => {
  // Mock organizations
  const organizations: Organization[] = [
    { id: 'org_1', name: 'Al-Huda Arena' },
    { id: 'org_2', name: 'Sports Complex West' },
    { id: 'org_3', name: 'Elite Training Center' }
  ];

  // Mock metrics
  const mockMetrics = {
    monthlyBookings: 64,
    collectedRevenue: 133000.00,
    expectedRevenue: 307750.00,
    avgMonthlyRevenue: 135083.33
  };

  // Mock chart data
  const mockChartData = {
    revenues: [
      { month: 'Jan', value: 15000 },
      { month: 'Feb', value: 25000 },
      { month: 'Mar', value: 35000 },
      { month: 'Apr', value: 45000 },
      { month: 'May', value: 50000 },
      { month: 'Jun', value: 48000 },
      { month: 'Jul', value: 52000 },
      { month: 'Aug', value: 55000 },
      { month: 'Sep', value: 58000 },
      { month: 'Oct', value: 62000 },
      { month: 'Nov', value: 65000 },
      { month: 'Dec', value: 70000 }
    ],
    bookings: [
      { month: 'Jan', value: 20 },
      { month: 'Feb', value: 35 },
      { month: 'Mar', value: 45 },
      { month: 'Apr', value: 55 },
      { month: 'May', value: 65 },
      { month: 'Jun', value: 60 },
      { month: 'Jul', value: 68 },
      { month: 'Aug', value: 72 },
      { month: 'Sep', value: 75 },
      { month: 'Oct', value: 78 },
      { month: 'Nov', value: 82 },
      { month: 'Dec', value: 85 }
    ]
  };
  
  // Local state
  const [selectedOrg, setSelectedOrg] = useState<Organization>(organizations[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'mock' | 'firebase'>('mock');

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `Kshs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get current month name
  const getCurrentMonthName = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[new Date().getMonth()];
  };

  // KPI cards data
  const kpiCards = useMemo(() => {
    const currentMonth = getCurrentMonthName();
    return [
      {
        icon: <Bookmark className="w-8 h-8" />,
        label: `${currentMonth} Bookings`,
        value: mockMetrics.monthlyBookings.toString(),
        bgColor: '#FF000410',
        borderColor: '#FF0004'
      },
      {
        icon: <DollarSign className="w-8 h-8" />,
        label: `${currentMonth} Collected Revenue`,
        value: formatCurrency(mockMetrics.collectedRevenue),
        bgColor: '#00943520',
        borderColor: '#009435'
      },
      {
        icon: <TrendingUp className="w-8 h-8" />,
        label: `${currentMonth} Expected Revenue`,
        value: formatCurrency(mockMetrics.expectedRevenue),
        bgColor: '#003BFF15',
        borderColor: '#003BFF'
      },
      {
        icon: <Percent className="w-8 h-8" />,
        label: 'Avg Monthly Revenue',
        value: formatCurrency(mockMetrics.avgMonthlyRevenue),
        bgColor: '#8B00FF15',
        borderColor: '#8B00FF'
      }
    ];
  }, [mockMetrics]);

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

          {/* Data Source Indicator */}
          <div className="p-4 border-b border-green-700">
            <div className="bg-green-800 rounded px-3 py-1 text-xs text-white text-center">
              Data: {dataSource === 'mock' ? 'Mock Data' : 'Firebase'}
            </div>
          </div>

          {/* Organization Selector */}
          <div className="p-4">
            <div className="relative">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="w-full bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-between transition-colors"
              >
                <span className="text-sm truncate">{selectedOrg.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${orgDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {orgDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org);
                        setOrgDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                        selectedOrg.id === org.id ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="block px-3 py-2 text-white bg-green-600 rounded-lg">
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
                <h1 className="text-2xl font-semibold text-gray-900">{selectedOrg.name}</h1>
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
            {/* Notice Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                ⚠️ Currently showing mock data. Firebase integration pending authentication setup.
              </p>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {kpiCards.map((card, index) => (
                <KPICard key={index} {...card} />
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Total Revenues</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockChartData.revenues}>
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
              </div>

              {/* Bookings Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2025 Total Bookings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockChartData.bookings}>
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PitchProDashboardSimple;