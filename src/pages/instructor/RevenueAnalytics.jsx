import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Users, Calendar, BarChart3, PieChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Skeleton, ChartSkeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const RevenueAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalEnrollments: 0,
    monthlyEnrollments: 0,
    averageOrderValue: 0,
    topCourses: [],
    revenueChart: [],
    enrollmentChart: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/instructor/analytics?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-8" />
          {/* Key Metrics Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>

          {/* Table Skeleton */}
          <Skeleton className="h-96 rounded-lg theme-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/instructor/dashboard" className="mr-4 p-2 hover:theme-bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 theme-text-primary" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold theme-text-primary">Revenue Analytics</h1>
              <p className="theme-text-secondary">Track your earnings and course performance</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border theme-border rounded-lg theme-card theme-text-primary"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Total Revenue</p>
                <p className="text-2xl font-bold theme-text-primary">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Monthly Revenue</p>
                <p className="text-2xl font-bold theme-text-primary">{formatCurrency(analytics.monthlyRevenue)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Total Enrollments</p>
                <p className="text-2xl font-bold theme-text-primary">{analytics.totalEnrollments}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Avg Order Value</p>
                <p className="text-2xl font-bold theme-text-primary">{formatCurrency(analytics.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center mb-6">
              <BarChart3 className="w-5 h-5 theme-text-primary mr-2" />
              <h2 className="text-xl font-semibold theme-text-primary">Revenue Trend</h2>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={formatDate}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enrollment Chart */}
          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center mb-6">
              <Users className="w-5 h-5 theme-text-primary mr-2" />
              <h2 className="text-xl font-semibold theme-text-primary">Enrollment Trend</h2>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.enrollmentChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    formatter={(value) => [value, 'Enrollments']}
                    labelFormatter={formatDate}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar
                    dataKey="enrollments"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="theme-card p-6 rounded-lg">
          <div className="flex items-center mb-6">
            <PieChart className="w-5 h-5 theme-text-primary mr-2" />
            <h2 className="text-xl font-semibold theme-text-primary">Top Performing Courses</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b theme-border">
                  <th className="text-left py-3 theme-text-secondary font-medium">Course</th>
                  <th className="text-left py-3 theme-text-secondary font-medium">Enrollments</th>
                  <th className="text-left py-3 theme-text-secondary font-medium">Revenue</th>
                  <th className="text-left py-3 theme-text-secondary font-medium">Avg Rating</th>
                  <th className="text-left py-3 theme-text-secondary font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topCourses.map((course, index) => (
                  <tr key={course.id} className="border-b theme-border hover:theme-bg-secondary">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium theme-text-primary">{course.title}</p>
                          <p className="text-sm theme-text-muted">{course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 theme-text-primary font-medium">{course.enrollments}</td>
                    <td className="py-4 theme-text-primary font-medium">{formatCurrency(course.revenue)}</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="theme-text-primary font-medium">{course.rating.toFixed(1)}</span>
                        <span className="text-yellow-500 ml-1">⭐</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(course.conversionRate * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm theme-text-muted">{(course.conversionRate * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {analytics.topCourses.length === 0 && (
            <div className="text-center py-8">
              <PieChart className="w-16 h-16 theme-text-muted mx-auto mb-4" />
              <p className="theme-text-secondary">No course data available for the selected period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;