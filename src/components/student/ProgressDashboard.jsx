import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  BookOpen, FileText, HelpCircle, Video, Clock, TrendingUp, Award,
  Calendar, Target, Activity, Users, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../common/Skeleton';
import axios from 'axios';

const ProgressDashboard = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, [courseId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/progress/dashboard/${courseId}`);
      setProgressData(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between mb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-4 w-full rounded-full mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Activity className="w-12 h-12 mx-auto mb-2" />
            <p>{error}</p>
          </div>
          <button
            onClick={fetchProgressData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, lectureProgress, assignmentProgress, quizPerformance, liveAttendance, activityMetrics } = progressData;

  // Chart colors
  const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#8B5CF6',
    success: '#059669'
  };

  // Lecture Progress Pie Chart Data
  const lectureChartData = [
    { name: 'Completed', value: lectureProgress.chartData.completed, color: COLORS.success },
    { name: 'Remaining', value: lectureProgress.chartData.remaining, color: COLORS.warning }
  ];

  // Assignment Progress Bar Chart Data
  const assignmentChartData = assignmentProgress.chartData.map((assignment, index) => ({
    name: assignment.name.length > 15 ? assignment.name.substring(0, 15) + '...' : assignment.name,
    score: assignment.percentage,
    maxScore: 100,
    status: assignment.status
  }));

  // Quiz Performance Line Chart Data
  const quizTimelineData = quizPerformance.performanceOverTime.map(quiz => ({
    name: `Quiz ${quiz.attempt}`,
    score: quiz.score,
    date: new Date(quiz.date).toLocaleDateString()
  }));

  // Live Attendance Donut Chart Data
  const attendanceChartData = [
    { name: 'Attended', value: liveAttendance.chartData.attended, color: COLORS.primary },
    { name: 'Missed', value: liveAttendance.chartData.missed, color: COLORS.danger }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Progress Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your learning journey and achievements
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall Course Completion
            </h2>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(summary.overallCompletionPercentage)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${summary.overallCompletionPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.completedLectures}/{summary.totalLectures}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lectures</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.submittedAssignments}/{summary.totalAssignments}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Assignments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.completedQuizzes}/{summary.totalQuizzes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.attendedLiveClasses}/{summary.totalLiveClasses}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Live Classes</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityMetrics.totalTimeSpent}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityMetrics.currentStreak} days
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Quiz Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(summary.averageQuizScore)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Activity</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activityMetrics.lastActivityDate
                    ? new Date(activityMetrics.lastActivityDate).toLocaleDateString()
                    : 'No activity'
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Lecture Progress Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lecture Progress
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={lectureChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {lectureChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Live Attendance Donut Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Class Attendance
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assignment Progress Bar Chart */}
        {assignmentChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assignment Scores
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill={COLORS.primary} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quiz Performance Timeline */}
        {quizTimelineData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiz Performance Over Time
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quizTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.info}
                  strokeWidth={3}
                  dot={{ fill: COLORS.info, strokeWidth: 2, r: 6 }}
                  name="Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;