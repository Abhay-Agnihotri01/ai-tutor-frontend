import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, DollarSign, TrendingUp, Activity,
  Monitor, Shield, AlertTriangle, Eye, Play, Settings,
  BarChart3, Clock, UserCheck, Video, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const EnhancedAdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    fetchLiveClasses();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchRecentActivities();
      fetchLiveClasses();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard/enhanced?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/activities?limit=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchLiveClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/live-classes?status=live&limit=5`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLiveClasses(data.liveClasses);
      }
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    }
  };

  const joinLiveClass = async (meetingId) => {
    try {
      const response = await fetch(`${API_URL}/admin/live-classes/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Open Jitsi meeting in new window
        const jitsiDomain = data.meetingConfig.domain || '8x8.vc';
        const jitsiUrl = `https://${jitsiDomain}/${meetingId}?jwt=${data.meetingConfig.jwt}`;
        window.open(jitsiUrl, '_blank', 'width=1200,height=800');
        toast.success('Joined live class as admin');
      }
    } catch (error) {
      toast.error('Failed to join live class');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              Enhanced Admin Dashboard
            </h1>
            <p className="theme-text-secondary">
              Real-time platform monitoring and management
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border theme-border rounded-lg theme-bg"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button onClick={() => window.location.reload()}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Status */}
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-green-800 dark:text-green-200 font-medium">
              System Status: {dashboard?.systemHealth?.status || 'Healthy'}
            </span>
            <span className="ml-auto text-sm text-green-600 dark:text-green-400">
              Uptime: {Math.floor((dashboard?.systemHealth?.uptime || 0) / 3600)}h
            </span>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Total Users</p>
                <p className="text-2xl font-bold theme-text-primary">{dashboard?.stats?.totalUsers || 0}</p>
                <p className="text-sm text-green-600">
                  +{dashboard?.growth?.userGrowth?.toFixed(1) || 0}% growth
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Total Revenue</p>
                <p className="text-2xl font-bold theme-text-primary">${dashboard?.stats?.totalRevenue || 0}</p>
                <p className="text-sm text-green-600">
                  +{dashboard?.growth?.revenueGrowth?.toFixed(1) || 0}% growth
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Live Classes</p>
                <p className="text-2xl font-bold theme-text-primary">{dashboard?.stats?.activeLiveClasses || 0}</p>
                <p className="text-sm theme-text-secondary">Currently active</p>
              </div>
              <Video className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm theme-text-muted">Active Instructors</p>
                <p className="text-2xl font-bold theme-text-primary">{dashboard?.stats?.activeInstructors || 0}</p>
                <p className="text-sm theme-text-secondary">Teaching now</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link to="/admin/activities" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-center">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold theme-text-primary text-sm">Activity Monitor</h3>
            </div>
          </Link>

          <Link to="/admin/live-monitor" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-center">
              <Monitor className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold theme-text-primary text-sm">Live Monitor</h3>
            </div>
          </Link>

          <Link to="/admin/behavior-analytics" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold theme-text-primary text-sm">Behavior Analytics</h3>
            </div>
          </Link>

          <Link to="/admin/moderation" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-center">
              <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold theme-text-primary text-sm">Content Moderation</h3>
            </div>
          </Link>

          <Link to="/admin/system-health" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-semibold theme-text-primary text-sm">System Health</h3>
            </div>
          </Link>

          <Link to="/admin/settings" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="text-center">
              <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold theme-text-primary text-sm">Settings</h3>
            </div>
          </Link>
        </div>

        {/* Live Classes Monitor */}
        {liveClasses.length > 0 && (
          <div className="theme-card rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold theme-text-primary">Active Live Classes</h2>
              <div className="flex items-center text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </div>
            <div className="space-y-4">
              {liveClasses.map((liveClass) => (
                <div key={liveClass.id} className="flex items-center justify-between p-4 border theme-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium theme-text-primary">{liveClass.title}</h3>
                      <p className="text-sm theme-text-secondary">
                        by {liveClass.instructor?.firstName} {liveClass.instructor?.lastName}
                      </p>
                      <p className="text-sm theme-text-muted">
                        {liveClass.participantCount} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => joinLiveClass(liveClass.meetingId)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Monitor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity & Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="theme-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold theme-text-primary">Recent Activities</h2>
              <Link to="/admin/activities">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                  <p className="theme-text-secondary">No recent activities</p>
                </div>
              ) : (
                activities.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm theme-text-primary truncate">
                        {activity.User?.firstName} {activity.User?.lastName} {activity.action.replace('_', ' ')}
                      </p>
                      <p className="text-xs theme-text-muted">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="theme-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold theme-text-primary">Top Performing Courses</h2>
              <Link to="/admin/courses">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {dashboard?.topCourses?.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                  <p className="theme-text-secondary">No courses available</p>
                </div>
              ) : (
                dashboard?.topCourses?.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border theme-border rounded-lg">
                    <div>
                      <h3 className="font-medium theme-text-primary">{course.title}</h3>
                      <p className="text-sm theme-text-secondary">
                        {course.enrollments} enrollments • ⭐ {course.avgRating?.toFixed(1) || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold theme-text-primary">${course.revenue || 0}</p>
                      <p className="text-xs theme-text-muted">revenue</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;