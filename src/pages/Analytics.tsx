import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar } from 'recharts';
import KPICard from '../components/ui/KPICard';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFilteredStats, getYAxisValues, getTotalValue, generatePitchColor } from '@/utils/statsProcessor';
import { DateRangeStruct } from '@/types/dashboard';

const Analytics: React.FC = () => {
  const { selectedOrgId, currentOrganization, loading: orgLoading } = useOrganization();
  const { stats, pitches, loading: dataLoading, error } = useDashboardData(selectedOrgId);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Create date range for selected month
  const monthDateRange: DateRangeStruct = useMemo(() => ({
    type: 'Monthly',
    startDate: new Date(selectedYear, selectedMonth, 1),
    endDate: new Date(selectedYear, selectedMonth + 1, 0)
  }), [selectedYear, selectedMonth]);

  // Create date range for selected year
  const yearDateRange: DateRangeStruct = useMemo(() => ({
    type: 'Yearly',
    startDate: new Date(selectedYear, 0, 1),
    endDate: new Date(selectedYear, 11, 31)
  }), [selectedYear]);

  // Calculate KPIs for selected month
  const monthlyKPIs = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { totalNoOfSessions: 0, totalAmountCollected: 0, totalAmountExpected: 0 };
    }
    return getFilteredStats(monthDateRange, stats);
  }, [stats, monthDateRange]);

  // Calculate yearly totals for average
  const yearlyStats = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { totalNoOfSessions: 0, totalAmountCollected: 0, totalAmountExpected: 0 };
    }
    return getFilteredStats(yearDateRange, stats);
  }, [stats, yearDateRange]);

  // Calculate average monthly revenue (excluding current month if it's the current year)
  const avgMonthlyRevenue = useMemo(() => {
    if (!stats || stats.length === 0) return 0;

    const monthsWithData = new Set<string>();
    let totalRevenue = 0;

    stats.forEach(stat => {
      stat.days_stats.forEach(day => {
        const dayDate = day.date;
        if (dayDate.getFullYear() === selectedYear) {
          // Skip current month if viewing current year
          if (selectedYear === currentYear && dayDate.getMonth() === currentMonth) {
            return;
          }
          const monthKey = `${dayDate.getFullYear()}-${dayDate.getMonth()}`;
          monthsWithData.add(monthKey);
          totalRevenue += day.totalAmountCollected || 0;
        }
      });
    });

    return monthsWithData.size > 0 ? Math.round(totalRevenue / monthsWithData.size) : 0;
  }, [stats, selectedYear, currentYear, currentMonth]);

  // Generate monthly revenue data for line chart
  const revenueChartData = useMemo(() => {
    if (!stats || stats.length === 0 || !pitches || pitches.length === 0) {
      return shortMonths.map(month => ({ month, revenue: 0 }));
    }

    const revenueDatasets = getYAxisValues(yearDateRange, stats, pitches, true);
    const monthlyTotals = getTotalValue(revenueDatasets);

    return shortMonths.map((month, index) => ({
      month,
      revenue: monthlyTotals[index] || 0
    }));
  }, [stats, pitches, yearDateRange]);

  // Generate monthly bookings data for bar chart
  const bookingsChartData = useMemo(() => {
    if (!stats || stats.length === 0 || !pitches || pitches.length === 0) {
      return shortMonths.map(month => ({ month, bookings: 0 }));
    }

    const bookingsDatasets = getYAxisValues(yearDateRange, stats, pitches, false);
    const monthlyTotals = getTotalValue(bookingsDatasets);

    return shortMonths.map((month, index) => ({
      month,
      bookings: monthlyTotals[index] || 0
    }));
  }, [stats, pitches, yearDateRange]);

  // Calculate pitch-level distribution for donut charts
  const pitchDistribution = useMemo(() => {
    if (!stats || stats.length === 0 || !pitches || pitches.length === 0) {
      return { bookings: [], revenue: [] };
    }

    const pitchBookings: { name: string; value: number; color: string }[] = [];
    const pitchRevenue: { name: string; value: number; color: string }[] = [];

    pitches.forEach(pitch => {
      const pitchStats = stats.filter(s => s.pitch_ref === pitch.id);
      let totalBookings = 0;
      let totalRevenue = 0;

      pitchStats.forEach(stat => {
        stat.days_stats.forEach(day => {
          // Filter by selected month
          if (day.date.getFullYear() === selectedYear && day.date.getMonth() === selectedMonth) {
            totalBookings += day.totalNoOfSessions || 0;
            totalRevenue += day.totalAmountCollected || 0;
          }
        });
      });

      if (totalBookings > 0 || totalRevenue > 0) {
        const color = pitch.color || generatePitchColor(pitch.id);
        pitchBookings.push({ name: pitch.name, value: totalBookings, color });
        pitchRevenue.push({ name: pitch.name, value: totalRevenue, color });
      }
    });

    return { bookings: pitchBookings, revenue: pitchRevenue };
  }, [stats, pitches, selectedYear, selectedMonth]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handlePrevYear = () => setSelectedYear(prev => prev - 1);
  const handleNextYear = () => setSelectedYear(prev => prev + 1);

  // Loading state
  if (orgLoading || dataLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading analytics data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // No organization selected
  if (!selectedOrgId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="text-sm">Please select an organization to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentOrganization?.name || 'Analytics'}
            </h1>
            <Badge variant="outline" className="font-normal">
              {stats.length} Records
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Performance metrics and insights
          </p>
        </div>
      </div>

      {/* Date Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevYear}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold text-gray-700 min-w-[60px] text-center">{selectedYear}</span>
          <Button variant="ghost" size="icon" onClick={handleNextYear}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Bookings"
          value={monthlyKPIs.totalNoOfSessions.toLocaleString()}
          icon={<Calendar className="w-8 h-8" />}
          bgColor="red"
        />
        <KPICard
          title="Collected Revenue"
          value={`Ksh ${monthlyKPIs.totalAmountCollected.toLocaleString()}`}
          icon={<DollarSign className="w-8 h-8" />}
          bgColor="green"
        />
        <KPICard
          title="Expected Revenue"
          value={`Ksh ${monthlyKPIs.totalAmountExpected.toLocaleString()}`}
          icon={<TrendingUp className="w-8 h-8" />}
          bgColor="blue"
        />
        <KPICard
          title="Avg Monthly Revenue"
          value={`Ksh ${avgMonthlyRevenue.toLocaleString()}`}
          icon={<BarChart3 className="w-8 h-8" />}
          bgColor="purple"
        />
      </div>

      {/* Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Distribution */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
            Bookings Distribution - {months[selectedMonth]}
          </h3>
          {pitchDistribution.bookings.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pitchDistribution.bookings}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        {pitchDistribution.bookings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Bookings']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">
                        {monthlyKPIs.totalNoOfSessions}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {pitchDistribution.bookings.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <span className="text-base text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-base font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No booking data for {months[selectedMonth]} {selectedYear}
            </div>
          )}
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
            Revenue Distribution - {months[selectedMonth]}
          </h3>
          {pitchDistribution.revenue.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pitchDistribution.revenue}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        startAngle={90}
                        endAngle={450}
                        dataKey="value"
                      >
                        {pitchDistribution.revenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`Ksh ${value.toLocaleString()}`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {monthlyKPIs.totalAmountCollected.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Ksh Total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 space-y-3">
                {pitchDistribution.revenue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <span className="text-base text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-base font-semibold text-gray-900">
                      Ksh {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No revenue data for {months[selectedMonth]} {selectedYear}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-gray-900">Total Revenue</h3>
          <span className="text-sm text-gray-500">Monthly Overview - {selectedYear}</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                fontWeight={500}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                fontWeight={500}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              />
              <Tooltip
                formatter={(value: number) => [`Ksh ${value.toLocaleString()}`, 'Revenue']}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4A7C59"
                strokeWidth={3}
                dot={{ fill: '#4A7C59', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#4A7C59', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings Bar Chart */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-gray-900">Monthly Bookings</h3>
          <span className="text-sm text-gray-500">Booking Trends - {selectedYear}</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                fontWeight={500}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                fontWeight={500}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Bookings']}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar
                dataKey="bookings"
                fill="#4A7C59"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedYear} Year Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{yearlyStats.totalNoOfSessions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue Collected</p>
            <p className="text-2xl font-bold text-green-600">Ksh {yearlyStats.totalAmountCollected.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Expected Revenue</p>
            <p className="text-2xl font-bold text-blue-600">Ksh {yearlyStats.totalAmountExpected.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
