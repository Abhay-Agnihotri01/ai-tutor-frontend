import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  TrendingUp, Users, BookOpen, DollarSign,
  Calendar, BarChart3, PieChart, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton, ChartSkeleton, Skeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalUsers: 0,
      totalCourses: 0,
      totalEnrollments: 0
    },
    growth: {
      userGrowth: 0,
      courseGrowth: 0,
      revenueGrowth: 0
    },
    topCourses: [],
    topInstructors: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [isAuthenticated, user?.role, timeRange]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              Analytics Dashboard
            </h1>
            <p className="theme-text-secondary">
              Platform insights and performance metrics
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))
          ) : (
            <>
              <div className="theme-card p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-muted">Total Revenue</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      ${analytics.overview.totalRevenue.toLocaleString()}
                    </p>
                    <p className={`text-sm flex items-center mt-1 ${analytics.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {analytics.growth.revenueGrowth >= 0 ? '+' : ''}{analytics.growth.revenueGrowth}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="theme-card p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-muted">Total Users</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {analytics.overview.totalUsers.toLocaleString()}
                    </p>
                    <p className={`text-sm flex items-center mt-1 ${analytics.growth.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {analytics.growth.userGrowth >= 0 ? '+' : ''}{analytics.growth.userGrowth}%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="theme-card p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-muted">Total Courses</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {analytics.overview.totalCourses.toLocaleString()}
                    </p>
                    <p className={`text-sm flex items-center mt-1 ${analytics.growth.courseGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {analytics.growth.courseGrowth >= 0 ? '+' : ''}{analytics.growth.courseGrowth}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="theme-card p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm theme-text-muted">Total Enrollments</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {analytics.overview.totalEnrollments.toLocaleString()}
                    </p>
                    <p className="text-sm flex items-center mt-1 text-blue-600">
                      <Activity className="w-4 h-4 mr-1" />
                      Active
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Top Courses */}
              <div className="theme-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Top Performing Courses
                </h3>
                <div className="space-y-4">
                  {analytics.topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border theme-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium theme-text-primary">{course.title}</p>
                          <p className="text-sm theme-text-secondary">{course.enrollments} enrollments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold theme-text-primary">${course.revenue}</p>
                        <p className="text-sm theme-text-secondary">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Instructors */}
              <div className="theme-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Top Instructors
                </h3>
                <div className="space-y-4">
                  {analytics.topInstructors.map((instructor, index) => (
                    <div key={instructor.id} className="flex items-center justify-between p-3 border theme-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium theme-text-primary">
                            {instructor.firstName} {instructor.lastName}
                          </p>
                          <p className="text-sm theme-text-secondary">{instructor.courses} courses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold theme-text-primary">{instructor.students}</p>
                        <p className="text-sm theme-text-secondary">Students</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        {loading ? (
          <Skeleton className="h-48 w-full rounded-lg theme-card" />
        ) : (
          <div className="theme-card p-6 rounded-lg">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Platform Activity
            </h3>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border theme-border rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'enrollment' ? 'bg-green-500' :
                    activity.type === 'course' ? 'bg-blue-500' :
                      activity.type === 'user' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                  <div className="flex-1">
                    <p className="text-sm theme-text-primary">{activity.description}</p>
                    <p className="text-xs theme-text-secondary">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;