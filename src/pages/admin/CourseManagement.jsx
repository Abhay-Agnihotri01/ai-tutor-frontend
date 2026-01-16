import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  BookOpen, Search, Eye, Edit, Trash2,
  CheckCircle, XCircle, Users, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-hot-toast';
import { CourseCardSkeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [paginatedCourses, setPaginatedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAuthenticated } = useAuth();

  const itemsPerPage = 12;

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCourses();
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter]);

  useEffect(() => {
    paginateCourses();
  }, [filteredCourses, currentPage]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course =>
        statusFilter === 'published' ? course.isPublished : !course.isPublished
      );
    }

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateCourses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCourses(filteredCourses.slice(startIndex, endIndex));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handleStatusToggle = async (courseId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/courses/${courseId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      });

      if (response.ok) {
        setCourses(prev => prev.map(course =>
          course.id === courseId ? { ...course, isPublished: !currentStatus } : course
        ));
        toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      }
    } catch (error) {
      toast.error('Failed to update course status');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCourses(prev => prev.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              Course Management
            </h1>
            <p className="theme-text-secondary">
              Manage all platform courses and their status
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="theme-card p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <div className="text-sm theme-text-secondary flex items-center">
              {filteredCourses.length > 0 ? (
                <>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses</>
              ) : (
                'No courses found'
              )}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <div key={course.id} className="theme-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={course.thumbnail || `data:image/svg+xml;base64,${btoa(`<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#6366f1"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">Course</text></svg>`)}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${course.isPublished
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold theme-text-primary mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-sm theme-text-secondary mb-3">
                  by {course.instructor?.firstName} {course.instructor?.lastName}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="theme-text-secondary">{course.enrollments || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="theme-text-secondary">${course.price || 0}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link to={`/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    onClick={() => handleStatusToggle(course.id, course.isPublished)}
                    className={`flex-1 ${course.isPublished
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                  >
                    {course.isPublished ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {paginatedCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 theme-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold theme-text-primary mb-2">
              No courses found
            </h3>
            <p className="theme-text-secondary">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCourses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;