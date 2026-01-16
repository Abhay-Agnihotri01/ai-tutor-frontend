import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Shield, Settings, BarChart3, UserCheck,
  AlertTriangle, Eye, Edit, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { DashboardSkeleton, Skeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeInstructors: 0,
    pendingApprovals: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const { user, isAuthenticated, loading } = useAuth();

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, user?.role]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
        setRecentUsers(data.recentUsers || []);
        setRecentCourses(data.recentCourses || []);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              Admin Dashboard
            </h1>
            <p className="theme-text-secondary">
              Welcome back, {user?.firstName}! Manage your platform and monitor activity.
            </p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <Link to="/admin/users">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/courses">
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm theme-text-muted">Total Users</p>
                <p className="text-2xl font-bold theme-text-primary">
                  {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm theme-text-muted">Total Courses</p>
                <p className="text-2xl font-bold theme-text-primary">
                  {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm theme-text-muted">Total Revenue</p>
                <p className="text-2xl font-bold theme-text-primary">
                  {dataLoading ? <Skeleton className="h-8 w-24" /> : `$${stats.totalRevenue}`}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm theme-text-muted">Active Instructors</p>
                <p className="text-2xl font-bold theme-text-primary">
                  {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.activeInstructors}
                </p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm theme-text-muted">Pending Approvals</p>
                <p className="text-2xl font-bold theme-text-primary">
                  {dataLoading ? <Skeleton className="h-8 w-16" /> : stats.pendingApprovals}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/enhanced" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">Enhanced Dashboard</h3>
                <p className="text-sm theme-text-secondary">Advanced monitoring</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/users" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">User Management</h3>
                <p className="text-sm theme-text-secondary">Manage all users</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/courses" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">Course Management</h3>
                <p className="text-sm theme-text-secondary">Oversee all courses</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/analytics" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">Analytics</h3>
                <p className="text-sm theme-text-secondary">Platform insights</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Enhanced Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/activities" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">Activity Monitor</h3>
                <p className="text-sm theme-text-secondary">Real-time user activities</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/live-monitor" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">Live Class Monitor</h3>
                <p className="text-sm theme-text-secondary">Monitor live classes</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/settings" className="theme-card p-4 rounded-lg hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <h3 className="font-semibold theme-text-primary">Settings</h3>
                <p className="text-sm theme-text-secondary">Platform settings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="theme-card rounded-lg p-6">
            <h2 className="text-xl font-bold theme-text-primary mb-6">Recent Users</h2>
            <div className="space-y-4">
              {dataLoading ? (
                // Skeletons for Recent Users
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border theme-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                  <p className="theme-text-secondary">No recent users</p>
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border theme-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium theme-text-primary">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm theme-text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'instructor'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="theme-card rounded-lg p-6">
            <h2 className="text-xl font-bold theme-text-primary mb-6">Recent Courses</h2>
            <div className="space-y-4">
              {dataLoading ? (
                // Skeletons for Recent Courses
                [...Array(5)].map((_, i) => (
                  <div key={i} className="p-3 border theme-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-5 w-20 rounded" />
                    </div>
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))
              ) : recentCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                  <p className="theme-text-secondary">No recent courses</p>
                </div>
              ) : (
                recentCourses.map((course) => (
                  <div key={course.id} className="p-3 border theme-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium theme-text-primary">{course.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${course.isPublished
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm theme-text-secondary">
                      by {course.instructor?.firstName} {course.instructor?.lastName}
                    </p>
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

export default AdminDashboard;