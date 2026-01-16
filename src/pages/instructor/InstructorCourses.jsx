import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import { CourseCardSkeleton } from '../../components/common/Skeleton';
import { API_URL, BASE_URL } from '../../config/api';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedCourses, setPaginatedCourses] = useState([]);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    paginateCourses();
  }, [courses, searchTerm, currentPage]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/instructor/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      const response = await fetch(`${API_URL}/instructor/courses/${courseId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(prev => prev.map(course =>
          course.id === courseId
            ? { ...course, isPublished: data.course.isPublished }
            : course
        ));
        toast.success(data.message);
      } else {
        throw new Error('Failed to publish course');
      }
    } catch (error) {
      toast.error('Failed to publish course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/instructor/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCourses(prev => prev.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginateCourses = () => {
    const filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCourses(filtered.slice(startIndex, endIndex));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/instructor/dashboard" className="mr-4 p-2 hover:theme-bg-secondary rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 theme-text-primary" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold theme-text-primary">My Courses</h1>
                <p className="theme-text-secondary">Manage all your courses</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/instructor/dashboard" className="mr-4 p-2 hover:theme-bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 theme-text-primary" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold theme-text-primary">My Courses</h1>
              <p className="theme-text-secondary">Manage all your courses</p>
            </div>
          </div>
          <Link to="/instructor/course/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 theme-card theme-text-primary"
            />
          </div>
        </div>

        {/* Results Info */}
        {filteredCourses.length > 0 && (
          <div className="mb-6">
            <p className="theme-text-secondary">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 theme-text-muted mx-auto mb-4">📚</div>
            <h3 className="text-lg font-semibold theme-text-primary mb-2">
              {searchTerm ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="theme-text-secondary mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first course to start teaching'}
            </p>
            {!searchTerm && (
              <Link to="/instructor/course/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCourses.map((course) => (
                <div key={course.id} className="theme-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={course.thumbnail ? (
                        course.thumbnail.startsWith('http')
                          ? course.thumbnail
                          : `${BASE_URL}${course.thumbnail}`
                      ) : `data:image/svg+xml;base64,${btoa(`<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#6366f1"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">Course</text></svg>`)}`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#6366f1"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">Course</text></svg>`)}`;
                      }}
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
                    <h3 className="font-semibold theme-text-primary mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm theme-text-secondary mb-3 line-clamp-2">{course.shortDescription}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm theme-text-secondary">
                      <div>
                        <span className="font-medium">{course.students || 0}</span> students
                      </div>
                      <div>
                        <span className="font-medium">${course.revenue || 0}</span> revenue
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">{course.category}</span> • <span className="font-medium">{course.level}</span>
                      </div>
                    </div>

                    {/* Publish/Unpublish Button */}
                    <div className="mb-3">
                      <Button
                        size="sm"
                        onClick={() => handlePublishCourse(course.id)}
                        className={`w-full ${course.isPublished
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Link to={`/instructor/course/${course.id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Course
                          </Button>
                        </Link>
                        <Link to={`/instructor/course/${course.id}/builder`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Build Content
                          </Button>
                        </Link>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/courses/${course.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 flex-1"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          </>
        )}
      </div>
    </div>
  );
};

export default InstructorCourses;