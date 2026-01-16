import { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config/api';

const AdminLogin = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'admin_not_found':
          toast.error('Admin account not found. Please contact system administrator.');
          break;
        case 'access_denied':
          toast.error('Access denied. Admin privileges required.');
          break;
        case 'auth_failed':
          toast.error('Authentication failed. Please try again.');
          break;
        default:
          toast.error('Login failed. Please try again.');
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect non-admin users to regular dashboard
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success && result.user?.role === 'admin') {
        // Use the login function from AuthContext
        login(result.user, result.token);
        toast.success('Admin login successful!');
        // Navigation will be handled by the Navigate component above
      } else if (result.success && result.user?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(result.message || 'Invalid admin credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth with admin role parameter
    window.location.href = `${API_URL}/auth/google?role=admin`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold theme-text-primary">Admin Access</h2>
          <p className="mt-2 text-sm theme-text-secondary">
            Restricted area - Admin credentials required
          </p>
        </div>

        {/* Login Form */}
        <div className="theme-card rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Admin Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                icon={Mail}
                placeholder="admin@learnhub.com"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon={Lock}
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Admin Sign In'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t theme-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 theme-bg theme-text-secondary">Or continue with</span>
              </div>
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google Admin Login
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800 dark:text-red-200">
                This is a restricted admin area. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Back to main site */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            ← Back to LearnHub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;