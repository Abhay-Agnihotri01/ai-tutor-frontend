import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import activityService from './services/activityService';
// import LiveClassRoom from './components/live/JitsiRoom';
import LiveClassThankYou from './components/live/LiveClassThankYou';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast, ToastBar } from 'react-hot-toast';
import { X } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import LoadingScreen from './components/common/LoadingScreen';
import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import RoleSelection from './pages/RoleSelection';
import CourseLearn from './pages/CourseLearn';
import Profile from './pages/Profile';
import MyLearning from './pages/MyLearning';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import CourseBuilder from './pages/instructor/CourseBuilder';
import InstructorCourses from './pages/instructor/InstructorCourses';
import RevenueAnalytics from './pages/instructor/RevenueAnalytics';
import EnrollmentAnalytics from './pages/instructor/EnrollmentAnalytics';
import AssignmentSubmissions from './pages/instructor/AssignmentSubmissions';
import CourseReviews from './pages/instructor/CourseReviews';
import CreateTextLecture from './components/instructor/CreateTextLecture';
import GradeSubmission from './pages/instructor/GradeSubmission';
import RecordingsDashboard from './pages/instructor/RecordingsDashboard';
import CertificateVerification from './pages/CertificateVerification';
import Certificates from './pages/Certificates';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import EnhancedAdminDashboard from './pages/admin/EnhancedAdminDashboard';
import ActivityMonitor from './pages/admin/ActivityMonitor';
import LiveClassMonitor from './pages/admin/LiveClassMonitor';
import CommunicationPanel from './components/admin/CommunicationPanel';
import InstructorCommunicationPanel from './components/instructor/CommunicationPanel';
import GroupChat from './components/student/GroupChat';
import IssuesPage from './pages/student/IssuesPage';
import ProgressDashboard from './components/student/ProgressDashboard';
import PublicProfile from './pages/PublicProfile';
import Notifications from './pages/Notifications';
import { NotificationProvider } from './context/NotificationContext';

import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import axios from 'axios';

import { BASE_URL } from './config/api';

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;

// Clear invalid tokens on app load
const token = localStorage.getItem('token');
if (token === 'null' || token === 'undefined' || !token) {
  localStorage.removeItem('token');
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


const PageActivityTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Debounce or filter if needed, but for now log every page view
    // Avoid logging internal redirects or rapid changes if possible, but basic is fine.
    // Also check if valid path
    if (location.pathname) {
      const details = {
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection: navigator.connection?.effectiveType || 'unknown',
        referrer: document.referrer || 'direct'
      };
      activityService.logActivity('page_view', location.pathname, details);
    }
  }, [location]);

  return null;
}

const AppContent = () => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <Router>
      <PageActivityTracker />
      <div className={`min-h-screen theme-bg-primary theme-text-primary ${isDark ? 'dark' : ''} animate-fade-in`}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/learn/:id" element={<CourseLearn />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/role-selection" element={<RoleSelection />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/instructor" element={<Navigate to="/instructor/dashboard" replace />} />
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<InstructorCourses />} />
            <Route path="/instructor/analytics" element={<RevenueAnalytics />} />
            <Route path="/instructor/enrollments" element={<EnrollmentAnalytics />} />
            <Route path="/instructor/course/create" element={<CreateCourse />} />
            <Route path="/instructor/course/:id/edit" element={<EditCourse />} />
            <Route path="/instructor/course/:id/builder" element={<CourseBuilder />} />
            <Route path="/instructor/submissions/:quizId" element={<AssignmentSubmissions />} />
            <Route path="/instructor/course/:courseId/reviews" element={<CourseReviews />} />
            <Route path="/instructor/text-lecture/create" element={<CreateTextLecture />} />
            <Route path="/instructor/grade/:submissionId" element={<GradeSubmission />} />
            <Route path="/instructor/recordings" element={<RecordingsDashboard />} />
            <Route path="/instructor/communications" element={<InstructorCommunicationPanel />} />
            {/* <Route path="/instructor/live-class/:meetingId" element={<LiveClassRoom />} /> */}
            {/* <Route path="/student/live-class/:meetingId" element={<LiveClassRoom />} /> */}
            <Route path="/student/group-chat" element={<GroupChat />} />
            <Route path="/student/issues" element={<IssuesPage />} />
            <Route path="/student/progress/:courseId" element={<ProgressDashboard />} />
            {/* <Route path="/live-class/:meetingId" element={<LiveClassRoom />} /> */}
            {/* <Route path="/live-class/thank-you" element={<LiveClassThankYou />} /> */}
            <Route path="/verify-certificate/:certificateId" element={<CertificateVerification />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/enhanced" element={<EnhancedAdminDashboard />} />
            <Route path="/admin/activities" element={<ActivityMonitor />} />
            <Route path="/admin/live-monitor" element={<LiveClassMonitor />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/communications" element={<CommunicationPanel />} />
            <Route path="*" element={<div className="p-8 text-center theme-text-primary">404 - Page Not Found</div>} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          containerStyle={{
            top: 80,
          }}
          toastOptions={{
            duration: 4000,
            className: isDark ? 'dark' : '',
            style: {
              background: isDark ? '#1f2937' : '#fff',
              color: isDark ? '#fff' : '#000',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  <div className="flex-1 font-medium text-sm">
                    {message}
                  </div>
                  {t.type !== 'loading' && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4 opacity-70 hover:opacity-100" />
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
      </div>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;