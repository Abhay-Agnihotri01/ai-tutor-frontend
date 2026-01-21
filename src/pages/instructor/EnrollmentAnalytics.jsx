import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Search, Filter, Download,
    Users, BookOpen, DollarSign, TrendingUp,
    ChevronDown, ChevronUp, Mail, Calendar,
    CheckCircle, Clock, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config/api';
import Button from '../../components/common/Button';

const EnrollmentAnalytics = () => {
    const [data, setData] = useState({ enrollments: [], courseEnrollments: [], totalCount: 0 });
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, progress-desc, progress-asc

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/instructor/enrollments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                throw new Error('Failed to fetch enrollments');
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
            toast.error('Failed to load enrollment data');
        } finally {
            setLoading(false);
        }
    };

    // Filter and Sort Logic
    const filteredData = useMemo(() => {
        let result = [...data.enrollments];

        // 1. Search (Name or Email)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.student.name.toLowerCase().includes(query) ||
                item.student.email.toLowerCase().includes(query)
            );
        }

        // 2. Course Filter
        if (selectedCourse !== 'all') {
            result = result.filter(item => item.course.id === selectedCourse);
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(item => {
                if (statusFilter === 'completed') return item.progress === 100;
                if (statusFilter === 'active') return item.progress < 100 && item.progress > 0;
                if (statusFilter === 'not-started') return item.progress === 0;
                return true;
            });
        }

        // 4. Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.enrolledAt) - new Date(a.enrolledAt);
                case 'date-asc':
                    return new Date(a.enrolledAt) - new Date(b.enrolledAt);
                case 'progress-desc':
                    return b.progress - a.progress;
                case 'progress-asc':
                    return a.progress - b.progress;
                case 'revenue-desc':
                    return b.pricePaid - a.pricePaid;
                default:
                    return 0;
            }
        });

        return result;
    }, [data.enrollments, searchQuery, selectedCourse, statusFilter, sortBy]);

    // Derived Metrics
    const metrics = useMemo(() => {
        const totalRevenue = filteredData.reduce((sum, item) => sum + item.pricePaid, 0);
        const avgProgress = filteredData.length > 0
            ? Math.round(filteredData.reduce((sum, item) => sum + item.progress, 0) / filteredData.length)
            : 0;
        const activeStudents = filteredData.filter(item => item.progress > 0 && item.progress < 100).length;

        return { totalRevenue, avgProgress, activeStudents };
    }, [filteredData]);

    // Export CSV
    const exportCSV = () => {
        const headers = ['Student Name', 'Student Email', 'Course', 'Enrolled Date', 'Progress', 'Revenue', 'Status'];
        const rows = filteredData.map(item => [
            item.student.name,
            item.student.email,
            item.course.title,
            new Date(item.enrolledAt).toLocaleDateString(),
            `${item.progress}%`,
            `$${item.pricePaid}`,
            item.progress === 100 ? 'Completed' : item.progress > 0 ? 'In Progress' : 'Not Started'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'enrollments_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Get unique courses for filter dropdown
    const uniqueCourses = useMemo(() => {
        const courses = new Map();
        data.enrollments.forEach(item => {
            if (!courses.has(item.course.id)) {
                courses.set(item.course.id, item.course.title);
            }
        });
        return Array.from(courses.entries());
    }, [data.enrollments]);

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center">
                        <Link to="/instructor/dashboard" className="mr-4 p-2 hover:theme-bg-secondary rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 theme-text-primary" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold theme-text-primary">Enrollment Analytics</h1>
                            <p className="theme-text-secondary">Detailed insights into your student base</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={exportCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="theme-card p-6 rounded-lg border theme-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-muted">Filtered Students</p>
                                <p className="text-2xl font-bold theme-text-primary">{filteredData.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="theme-card p-6 rounded-lg border theme-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-muted">Active Learners</p>
                                <p className="text-2xl font-bold theme-text-primary">{metrics.activeStudents}</p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="theme-card p-6 rounded-lg border theme-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-muted">Avg Completion</p>
                                <p className="text-2xl font-bold theme-text-primary">{metrics.avgProgress}%</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="theme-card p-6 rounded-lg border theme-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm theme-text-muted">Revenue (Selection)</p>
                                <p className="text-2xl font-bold theme-text-primary">{formatCurrency(metrics.totalRevenue)}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                                <DollarSign className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="theme-card p-4 rounded-lg border theme-border mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border theme-border rounded-lg bg-transparent theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        {/* Course Filter */}
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-4 py-2 border theme-border rounded-lg bg-transparent theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Courses</option>
                            {uniqueCourses.map(([id, title]) => (
                                <option key={id} value={id}>{title}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border theme-border rounded-lg bg-transparent theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="not-started">Not Started</option>
                        </select>

                        {/* Sort Filter */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border theme-border rounded-lg bg-transparent theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="progress-desc">Highest Progress</option>
                            <option value="progress-asc">Lowest Progress</option>
                            <option value="revenue-desc">Highest Revenue</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="theme-card rounded-lg border theme-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="theme-bg-secondary border-b theme-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y theme-border">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan="6" className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center theme-text-secondary">
                                            <div className="flex flex-col items-center">
                                                <Search className="w-12 h-12 mb-4 text-gray-400" />
                                                <p className="text-lg font-medium">No enrollments found</p>
                                                <p className="text-sm">Try adjusting your filters or search query</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="hover:theme-bg-secondary transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {item.student.avatar ? (
                                                        <img className="h-10 w-10 rounded-full object-cover mr-3" src={item.student.avatar} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 text-white font-bold">
                                                            {item.student.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium theme-text-primary">{item.student.name}</div>
                                                        <div className="text-xs theme-text-muted flex items-center">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {item.student.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        className="h-8 w-12 rounded object-cover mr-3"
                                                        src={item.course.thumbnail || 'https://via.placeholder.com/150'}
                                                        alt=""
                                                    />
                                                    <div className="text-sm theme-text-primary truncate max-w-[150px]" title={item.course.title}>
                                                        {item.course.title}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm theme-text-secondary flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {formatDate(item.enrolledAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-full max-w-[140px]">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium theme-text-primary">{item.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                        <div
                                                            className={`h-2.5 rounded-full ${item.progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                                                                }`}
                                                            style={{ width: `${item.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium theme-text-primary">
                                                    {formatCurrency(item.pricePaid)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.progress === 100
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : item.progress > 0
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {item.progress === 100 ? 'Completed' : item.progress > 0 ? 'In Progress' : 'Just Started'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EnrollmentAnalytics;
