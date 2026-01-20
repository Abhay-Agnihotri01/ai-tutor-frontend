import { useState, useEffect } from 'react';
import {
  Activity, Users, Search, Filter, Eye, Clock,
  MapPin, Smartphone, Monitor, RefreshCw, Globe, ArrowLeft, X
} from 'lucide-react';

// ... (existing code)

import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const ActivityMonitor = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    resource: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    fetchActivities();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchActivities, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filters, pagination.page, pagination.limit, autoRefresh]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`${API_URL}/admin/activities?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ userId: '', action: '', resource: '', search: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  // Helper to render metadata in the drawer
  // Helper to render metadata in the drawer
  const renderDrawerDetails = (details) => {
    if (!details || Object.keys(details).length === 0) return <div className="text-sm theme-text-muted">No additional details available.</div>;

    const metadataKeys = ['screen', 'viewport', 'language', 'platform', 'timezone', 'connection', 'referrer'];
    const hasMetadata = metadataKeys.some(k => details[k]);

    return (
      <div className="space-y-6">
        {/* Visual Metadata Icons */}
        {hasMetadata && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold theme-text-primary border-b theme-border pb-2">Device & Session Specs</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Screen & Viewport */}
              <div className="space-y-1">
                <div className="flex items-center text-sm theme-text-secondary" title="Physical Screen Size">
                  <Monitor className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">Screen:</span> {details.screen || 'N/A'}
                </div>
                {details.viewport && (
                  <div className="flex items-center text-sm theme-text-secondary" title="Browser Window Size">
                    <Monitor className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium mr-2">Viewport:</span> {details.viewport}
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="space-y-1">
                {details.platform && (
                  <div className="flex items-center text-sm theme-text-secondary">
                    <Smartphone className="w-4 h-4 mr-2" />
                    <span className="font-medium mr-2">OS:</span> {details.platform}
                  </div>
                )}
                {details.language && (
                  <div className="flex items-center text-sm theme-text-secondary">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="font-medium mr-2">Lang:</span> {details.language}
                  </div>
                )}
              </div>

              {/* Network & Location */}
              <div className="space-y-1">
                {details.timezone && (
                  <div className="flex items-center text-sm theme-text-secondary">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium mr-2">Timezone:</span> {details.timezone}
                  </div>
                )}
                {details.connection && (
                  <div className="flex items-center text-sm theme-text-secondary">
                    <Activity className="w-4 h-4 mr-2" />
                    <span className="font-medium mr-2">Network:</span> {details.connection}
                  </div>
                )}
              </div>

              {/* Referrer */}
              {details.referrer && (
                <div className="col-span-1 sm:col-span-2 flex items-center text-sm theme-text-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-2">Referrer:</span>
                  <span className="truncate" title={details.referrer}>{details.referrer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complex Data / Other Keys */}
        {Object.keys(details).some(k => !metadataKeys.includes(k)) && (
          <div>
            <h4 className="text-sm font-semibold theme-text-primary mb-2">Raw Data / Payload</h4>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs font-mono overflow-x-auto">
              <pre>
                {JSON.stringify(
                  Object.fromEntries(Object.entries(details).filter(([k]) => !metadataKeys.includes(k))),
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'create_course': return '📚';
      case 'enroll_course': return '✅';
      case 'join_live_class': return '🎥';
      case 'upload_video': return '📹';
      case 'submit_assignment': return '📝';
      default: return '⚡';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login': return 'text-green-600';
      case 'logout': return 'text-red-600';
      case 'create_course': return 'text-blue-600';
      case 'enroll_course': return 'text-purple-600';
      case 'join_live_class': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              Activity Monitor
            </h1>
            <p className="theme-text-secondary">
              Real-time user activity tracking and monitoring
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button onClick={fetchActivities}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="theme-card p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Search User
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border theme-border rounded-lg theme-bg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border theme-border rounded-lg bg-white dark:bg-gray-800 theme-text-primary"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create_course">Create Course</option>
                <option value="enroll_course">Enroll Course</option>
                <option value="join_live_class">Join Live Class</option>
                <option value="upload_video">Upload Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Resource
              </label>
              <select
                value={filters.resource}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
                className="w-full px-3 py-2 border theme-border rounded-lg bg-white dark:bg-gray-800 theme-text-primary"
              >
                <option value="">All Resources</option>
                <option value="course">Course</option>
                <option value="user">User</option>
                <option value="live_class">Live Class</option>
                <option value="video">Video</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="theme-card rounded-lg">
          <div className="p-6 border-b theme-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold theme-text-primary">
                Live Activity Feed
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm theme-text-muted">
                  {pagination.total} total activities
                </span>
                {autoRefresh && (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">Live</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y theme-divide">
            {loading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                <p className="theme-text-secondary">No activities found</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {activity.User?.firstName?.[0]}{activity.User?.lastName?.[0]}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col mb-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getActionIcon(activity.action)}</span>
                          <span className="font-medium theme-text-primary flex items-center gap-2">
                            {activity.User ? (
                              <>
                                {activity.User.firstName} {activity.User.lastName}
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 uppercase">
                                  {activity.User.role || 'User'}
                                </span>
                              </>
                            ) : (
                              <>
                                Visitor
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 uppercase">
                                  {activity.role || 'Visitor'}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 ml-7">
                          <span className={`text-sm font-medium ${getActionColor(activity.action)}`}>
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm theme-text-muted">
                            • {activity.resource}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm theme-text-muted">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(activity.created_at || activity.createdAt)}
                        </div>

                        {activity.ipAddress && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {activity.ipAddress}
                          </div>
                        )}

                        {activity.userAgent && (
                          <div className="flex items-center">
                            {activity.userAgent.includes('Mobile') ? (
                              <Smartphone className="w-3 h-3 mr-1" />
                            ) : (
                              <Monitor className="w-3 h-3 mr-1" />
                            )}
                            {activity.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t theme-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm theme-text-muted">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} activities
                  </div>
                  <select
                    value={pagination.limit}
                    onChange={handleLimitChange}
                    className="text-sm border theme-border rounded-md px-2 py-1 bg-white dark:bg-gray-800 theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>

                  <span className="px-3 py-1 text-sm theme-text-primary">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITY DETAILS DRAWER */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
              onClick={() => setSelectedActivity(null)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-full max-w-md transform transition ease-in-out duration-500 sm:duration-700">
                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-900 shadow-xl">
                  {/* Drawer Header */}
                  <div className="px-4 py-6 sm:px-6 border-b theme-border bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-lg font-medium theme-text-primary" id="slide-over-title">
                          Activity Details
                        </h2>
                        <p className="text-sm theme-text-secondary mt-1">
                          ID: {selectedActivity.id}
                        </p>
                      </div>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md theme-text-muted hover:theme-text-primary focus:outline-none"
                          onClick={() => setSelectedActivity(null)}
                        >
                          <span className="sr-only">Close panel</span>
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="relative mt-6 flex-1 px-4 sm:px-6 space-y-8 pb-1">

                    {/* User Section */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedActivity.User?.firstName?.[0] || 'V'}{selectedActivity.User?.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold theme-text-primary">
                          {selectedActivity.User
                            ? `${selectedActivity.User.firstName} ${selectedActivity.User.lastName}`
                            : 'Visitor'}
                        </h3>
                        {selectedActivity.User && (
                          <div className="text-sm theme-text-secondary mb-1">
                            {selectedActivity.User.email}
                          </div>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${selectedActivity.User ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedActivity.User?.role || selectedActivity.role || 'Visitor'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t theme-border pt-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Action</label>
                          <div className="mt-1 font-medium theme-text-primary flex items-center">
                            <span className="text-lg mr-2">{getActionIcon(selectedActivity.action)}</span>
                            {selectedActivity.action.replace(/_/g, ' ')}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Resource</label>
                          <div className="mt-1 font-medium theme-text-primary">
                            {selectedActivity.resource}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm theme-text-secondary">
                          <Clock className="w-4 h-4 mr-3 text-gray-400" />
                          {new Date(selectedActivity.created_at || selectedActivity.createdAt).toLocaleString()}
                        </div>
                        {selectedActivity.ipAddress && (
                          <div className="flex items-center text-sm theme-text-secondary">
                            <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                            {selectedActivity.ipAddress}
                          </div>
                        )}
                        {selectedActivity.userAgent && (
                          <div className="flex items-center text-sm theme-text-secondary">
                            {selectedActivity.userAgent.includes('Mobile') ? <Smartphone className="w-4 h-4 mr-3 text-gray-400" /> : <Monitor className="w-4 h-4 mr-3 text-gray-400" />}
                            <span className="truncate" title={selectedActivity.userAgent}>{selectedActivity.userAgent}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t theme-border pt-6">
                      <h3 className="text-sm font-medium theme-text-primary mb-4">Detailed Report</h3>
                      {renderDrawerDetails(selectedActivity.details)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMonitor;