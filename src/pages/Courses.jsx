import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import CourseCard from '../components/course/CourseCard';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { CourseCardSkeleton } from '../components/common/Skeleton';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCourses: 0 });
  const [searchParams] = useSearchParams();

  const itemsPerPage = 12;

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Backend Development',
    'Frontend Development',
    'UI/UX Design',
    'DevOps',
    'Cybersecurity'
  ];

  const levels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
    // Handle search parameter from URL
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams, currentPage, selectedCategory, selectedLevel, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_URL}/courses?${params}`);
      const data = await response.json();
      setCourses(data.courses || []);
      setPagination(data.pagination || { totalPages: 1, totalCourses: 0 });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold theme-text-primary mb-4">
            All Courses
          </h1>
          <p className="text-lg theme-text-secondary">
            Discover and learn from our extensive course library
          </p>
        </div>

        {/* Filters */}
        <div className="theme-card rounded-lg border theme-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="w-full pl-10 pr-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-card theme-text-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-card theme-text-primary"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent theme-card theme-text-primary"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level} className="capitalize">{level}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLevel('');
                handleFilterChange();
              }}
              className="flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="theme-text-secondary">
            {pagination.totalCourses > 0 ? (
              <>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalCourses)} of {pagination.totalCourses} courses</>
            ) : (
              'No courses found'
            )}
          </p>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalCourses}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 theme-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 theme-text-muted" />
            </div>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              No courses found
            </h3>
            <p className="theme-text-secondary mb-4">
              Try adjusting your search criteria or browse all courses
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLevel('');
                handleFilterChange();
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;