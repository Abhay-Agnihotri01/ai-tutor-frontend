import { useState, useEffect } from 'react';
import { BASE_URL } from '../config/api';
import { useParams } from 'react-router-dom';
import { User, MapPin, BookOpen, Trophy, Clock, Star, Calendar, Award } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';
import axios from 'axios';

const PublicProfile = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchPublicProfile();
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      const response = await axios.get(`/api/users/public-profile/${userId}`);
      setProfileUser(response.data.user);
      setEnrollments(response.data.enrollments || []);
      setAchievements(response.data.achievements || []);
    } catch (error) {
      setError('Profile not found or not public');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="theme-card rounded-lg overflow-hidden mb-8">
            <Skeleton className="h-48 w-full" />
            <div className="px-8 pb-8">
              <div className="relative flex flex-col md:flex-row items-center -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 theme-border bg-white dark:bg-gray-800 flex items-center justify-center p-1">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>
                <div className="mt-4 md:mt-16 md:ml-6 text-center md:text-left flex-1 w-full">
                  <Skeleton className="h-8 w-48 mx-auto md:mx-0 mb-3" />
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4 mx-auto md:mx-0 mb-4" />
                  <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="theme-card p-6 rounded-lg">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
            <div className="theme-card p-6 rounded-lg">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
          <div className="theme-card p-6 rounded-lg">
            <Skeleton className="h-6 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-16 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 theme-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold theme-text-primary mb-2">Profile Not Found</h2>
          <p className="theme-text-secondary">This profile doesn't exist or is not public.</p>
        </div>
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const totalHours = enrollments.reduce((total, enrollment) => {
    const course = enrollment.Course || enrollment.course;
    return total + Math.floor((course?.duration || 0) / 60);
  }, 0);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="theme-card rounded-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 px-8 py-12 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                  {profileUser.avatar ? (
                    <img
                      src={profileUser.avatar.startsWith('http') ? profileUser.avatar : `${BASE_URL}${profileUser.avatar}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className="text-4xl font-bold text-primary-600"
                    style={{ display: profileUser.avatar ? 'none' : 'flex' }}
                  >
                    {profileUser.firstName?.[0]}{profileUser.lastName?.[0]}
                  </span>
                </div>

                <div className="flex-1 text-white text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2">{profileUser.firstName} {profileUser.lastName}</h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start space-x-4 mb-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold capitalize shadow-xl border-2 border-white">
                      ✨ {profileUser.role}
                    </span>
                    {profileUser.location && (
                      <span className="flex items-center text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-full shadow-xl border-2 border-white dark:border-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                        <span className="font-semibold text-gray-800 dark:text-white">{profileUser.location}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-primary-100 mb-4 max-w-2xl">
                    {profileUser.bio || 'Learning enthusiast on LearnHub platform'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{enrollments.length} Courses</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span>{completedCourses} Completed</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{totalHours}h Learned</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="theme-card p-6 rounded-lg">
            <h3 className="text-xl font-bold theme-text-primary mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-primary-600" />
              Learning Journey
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold theme-text-primary">{totalHours}h</p>
                <p className="text-sm theme-text-secondary">Learning Time</p>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold theme-text-primary">{completedCourses}</p>
                <p className="text-sm theme-text-secondary">Completed</p>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold theme-text-primary">{enrollments.length}</p>
                <p className="text-sm theme-text-secondary">Total Courses</p>
              </div>
            </div>
          </div>

          <div className="theme-card p-6 rounded-lg">
            <h3 className="text-xl font-bold theme-text-primary mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-500" />
              Achievements
            </h3>
            <div className="space-y-3">
              {completedCourses >= 1 && (
                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-semibold theme-text-primary">First Course Completed</p>
                    <p className="text-sm theme-text-secondary">Completed their first learning milestone</p>
                  </div>
                </div>
              )}
              {enrollments.length >= 5 && (
                <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Star className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="font-semibold theme-text-primary">Course Collector</p>
                    <p className="text-sm theme-text-secondary">Enrolled in 5+ courses</p>
                  </div>
                </div>
              )}
              {completedCourses >= 3 && (
                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Award className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="font-semibold theme-text-primary">Dedicated Learner</p>
                    <p className="text-sm theme-text-secondary">Completed multiple courses</p>
                  </div>
                </div>
              )}
              {(completedCourses === 0 && enrollments.length === 0) && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 theme-text-muted mx-auto mb-3" />
                  <p className="theme-text-secondary">No achievements yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        {enrollments.length > 0 && (
          <div className="theme-card p-6 rounded-lg">
            <h3 className="text-xl font-bold theme-text-primary mb-6">Recent Learning Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.slice(0, 4).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center space-x-4 p-4 theme-bg-secondary rounded-lg">
                  <img
                    src={enrollment.Course?.thumbnail || 'https://via.placeholder.com/60x45/6366f1/ffffff?text=Course'}
                    alt={enrollment.Course?.title}
                    className="w-15 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold theme-text-primary text-sm">{enrollment.Course?.title}</h4>
                    <p className="text-xs theme-text-secondary mb-1">Progress: {enrollment.progress}%</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
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

export default PublicProfile;