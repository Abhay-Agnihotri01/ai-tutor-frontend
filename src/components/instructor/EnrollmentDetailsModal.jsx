import { useState, useEffect } from 'react';
import { X, Users, BookOpen, DollarSign, ChevronDown, ChevronUp, Calendar, Mail } from 'lucide-react';
import { API_URL } from '../../config/api';
import { toast } from 'react-hot-toast';

const EnrollmentDetailsModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ courseEnrollments: [], totalCount: 0 });
    const [expandedCourses, setExpandedCourses] = useState(new Set());

    useEffect(() => {
        if (isOpen) {
            fetchEnrollmentDetails();
        }
    }, [isOpen]);

    const fetchEnrollmentDetails = async () => {
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
                // Expand first course by default
                if (result.courseEnrollments?.length > 0) {
                    setExpandedCourses(new Set([result.courseEnrollments[0].courseId]));
                }
            } else {
                throw new Error('Failed to fetch enrollment details');
            }
        } catch (error) {
            console.error('Failed to fetch enrollment details:', error);
            toast.error('Failed to load enrollment details');
        } finally {
            setLoading(false);
        }
    };

    const toggleCourse = (courseId) => {
        setExpandedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform theme-card shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold theme-text-primary">Enrollment Details</h2>
                                <p className="text-sm theme-text-muted">
                                    {data.totalCount} total students across your courses
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
                        >
                            <X className="w-5 h-5 theme-text-muted" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                <span className="ml-3 theme-text-secondary">Loading enrollments...</span>
                            </div>
                        ) : data.courseEnrollments.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 theme-text-muted mx-auto mb-4" />
                                <h3 className="text-lg font-semibold theme-text-primary mb-2">No enrollments yet</h3>
                                <p className="theme-text-secondary">
                                    Students will appear here once they enroll in your courses.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.courseEnrollments.map((course) => (
                                    <div key={course.courseId} className="border theme-border rounded-lg overflow-hidden">
                                        {/* Course Header */}
                                        <button
                                            onClick={() => toggleCourse(course.courseId)}
                                            className="w-full flex items-center justify-between p-4 hover:theme-bg-secondary transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                                                <div className="text-left">
                                                    <h3 className="font-semibold theme-text-primary">{course.courseTitle}</h3>
                                                    <div className="flex items-center space-x-4 text-sm theme-text-muted">
                                                        <span className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            {course.totalEnrollments} students
                                                        </span>
                                                        <span className="flex items-center">
                                                            <DollarSign className="w-4 h-4 mr-1" />
                                                            {formatCurrency(course.totalRevenue)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {expandedCourses.has(course.courseId) ? (
                                                <ChevronUp className="w-5 h-5 theme-text-muted" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 theme-text-muted" />
                                            )}
                                        </button>

                                        {/* Student List */}
                                        {expandedCourses.has(course.courseId) && (
                                            <div className="border-t theme-border">
                                                <table className="w-full">
                                                    <thead className="theme-bg-secondary">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">Student</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">Enrolled</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">Paid</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">Progress</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y theme-border">
                                                        {course.students.map((student, idx) => (
                                                            <tr key={idx} className="hover:theme-bg-secondary">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center">
                                                                        {student.avatar ? (
                                                                            <img
                                                                                src={student.avatar}
                                                                                alt={student.name}
                                                                                className="w-8 h-8 rounded-full mr-3 object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                                                                                <span className="text-white text-xs font-medium">
                                                                                    {student.name.charAt(0).toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="font-medium theme-text-primary text-sm">{student.name}</p>
                                                                            <p className="text-xs theme-text-muted flex items-center">
                                                                                <Mail className="w-3 h-3 mr-1" />
                                                                                {student.email}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-sm theme-text-secondary flex items-center">
                                                                        <Calendar className="w-4 h-4 mr-1" />
                                                                        {formatDate(student.enrolledAt)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-sm font-medium theme-text-primary">
                                                                        {formatCurrency(student.pricePaid)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center">
                                                                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                                            <div
                                                                                className="bg-green-500 h-2 rounded-full"
                                                                                style={{ width: `${student.progress || 0}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs theme-text-muted">{student.progress || 0}%</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t theme-border flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentDetailsModal;
