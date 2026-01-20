import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Moon, Sun, Menu, X, User, LogOut, Search, BookOpen, Play, Award, Bell, ShoppingCart, Heart, ChevronDown, Globe, Briefcase, Code, Palette, Camera, Music, Dumbbell, TrendingUp, Shield, Users, MessageSquare, AlertTriangle, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import Button from '../common/Button';
import ReportIssue from '../student/ReportIssue';

import { BASE_URL } from '../../config/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const categoriesRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'instructor')) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch(`${BASE_URL}/admin-communications/unread-count`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.role]);

  const categories = [
    { name: 'Development', icon: Code, subcategories: ['Web Development', 'Mobile Development', 'Programming Languages', 'Game Development', 'Database Design', 'Software Testing'] },
    { name: 'Business', icon: Briefcase, subcategories: ['Entrepreneurship', 'Communication', 'Management', 'Sales', 'Strategy', 'Operations'] },
    { name: 'Finance & Accounting', icon: TrendingUp, subcategories: ['Accounting & Bookkeeping', 'Cryptocurrency', 'Finance', 'Financial Modeling', 'Investing & Trading', 'Money Management'] },
    { name: 'IT & Software', icon: Globe, subcategories: ['IT Certifications', 'Network & Security', 'Hardware', 'Operating Systems', 'Other IT & Software'] },
    { name: 'Office Productivity', icon: Briefcase, subcategories: ['Microsoft', 'Apple', 'Google', 'SAP', 'Oracle', 'Other Office Productivity'] },
    { name: 'Personal Development', icon: User, subcategories: ['Personal Transformation', 'Personal Productivity', 'Leadership', 'Career Development', 'Parenting & Relationships', 'Happiness'] },
    { name: 'Design', icon: Palette, subcategories: ['Web Design', 'Graphic Design', 'Design Tools', 'User Experience Design', 'Game Design', '3D & Animation'] },
    { name: 'Marketing', icon: TrendingUp, subcategories: ['Digital Marketing', 'Search Engine Optimization', 'Social Media Marketing', 'Branding', 'Marketing Fundamentals', 'Analytics & Automation'] },
    { name: 'Lifestyle', icon: Heart, subcategories: ['Arts & Crafts', 'Beauty & Makeup', 'Esoteric Practices', 'Food & Beverage', 'Gaming', 'Home Improvement'] },
    { name: 'Photography & Video', icon: Camera, subcategories: ['Digital Photography', 'Photography', 'Portrait Photography', 'Photography Tools', 'Commercial Photography', 'Video Design'] },
    { name: 'Health & Fitness', icon: Dumbbell, subcategories: ['Fitness', 'General Health', 'Sports', 'Nutrition & Diet', 'Yoga', 'Mental Health'] },
    { name: 'Music', icon: Music, subcategories: ['Instruments', 'Music Production', 'Music Fundamentals', 'Vocal', 'Music Techniques', 'Music Software'] }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isProfileOpen || isMenuOpen || isCategoriesOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isMenuOpen, isCategoriesOpen, isNotificationsOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="theme-card border-b theme-border sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 theme-logo rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold theme-text-primary hidden sm:block">LearnHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-1 theme-text-secondary hover:text-primary-600 py-2"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 theme-card rounded-lg shadow-xl theme-border border animate-scale-in z-50">
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {categories.map((category) => (
                        <div key={category.name} className="group">
                          <Link
                            to={`/courses?category=${encodeURIComponent(category.name.toLowerCase())}`}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:theme-bg-secondary transition-colors"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <category.icon className="w-5 h-5 text-primary-600" />
                            <span className="font-medium theme-text-primary">{category.name}</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for courses..."
                  className="w-full pl-10 pr-4 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Quick Links */}
            {isAuthenticated && user?.role === 'instructor' && (
              <Link to="/instructor/dashboard" className="theme-text-secondary hover:text-primary-600 font-medium">
                Instructor
              </Link>
            )}

            {isAuthenticated && user?.role === 'student' && (
              <Link to="/my-learning" className="theme-text-secondary hover:text-primary-600 font-medium">
                My Learning
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search */}
            {/* Mobile Search Button -> Opens Menu with Search focus */}
            <button
              onClick={() => {
                setIsMenuOpen(true);
                // Attempt to focus the search input after the menu opens
                setTimeout(() => {
                  const input = document.getElementById('mobile-search-input');
                  if (input) input.focus();
                }, 100);
              }}
              className="lg:hidden p-2 rounded-lg theme-bg-secondary hover:theme-bg-tertiary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications (for authenticated users) */}
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-tertiary transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 theme-card rounded-lg shadow-xl theme-border border animate-scale-in z-50">
                    <div className="p-4">
                      <h3 className="font-semibold theme-text-primary mb-3">Notifications</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        <div className="p-3 theme-bg-secondary rounded-lg">
                          <p className="text-sm theme-text-primary">New course available: Advanced React Patterns</p>
                          <p className="text-xs theme-text-muted mt-1">2 hours ago</p>
                        </div>
                        <div className="p-3 theme-bg-secondary rounded-lg">
                          <p className="text-sm theme-text-primary">Assignment graded in JavaScript Fundamentals</p>
                          <p className="text-xs theme-text-muted mt-1">1 day ago</p>
                        </div>
                        <div className="p-3 theme-bg-secondary rounded-lg">
                          <p className="text-sm theme-text-primary">Live class starting in 30 minutes</p>
                          <p className="text-xs theme-text-muted mt-1">2 days ago</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t theme-border">
                        <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-700">
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist (for students) */}
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/wishlist" className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-tertiary transition-colors relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart (for students) */}
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/cart" className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-tertiary transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg theme-bg-secondary hover:theme-bg-tertiary transition-all duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div
                className="relative"
                ref={profileRef}
              >
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:theme-bg-secondary transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 theme-logo rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 theme-card rounded-lg shadow-xl theme-border border animate-scale-in z-50">
                    <div className="p-4 border-b theme-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 theme-logo rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user?.avatar ? (
                            <img
                              src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium theme-text-primary truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-sm theme-text-muted truncate">{user?.email}</p>
                          <p className="text-xs text-primary-600 capitalize">{user?.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>View Profile</span>
                      </Link>

                      {user?.role === 'admin' ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Shield className="w-5 h-5" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/admin/users"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Users className="w-5 h-5" />
                            <span>User Management</span>
                          </Link>
                          <Link
                            to="/admin/courses"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <BookOpen className="w-5 h-5" />
                            <span>Course Management</span>
                          </Link>
                          <Link
                            to="/admin/analytics"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <TrendingUp className="w-5 h-5" />
                            <span>Platform Analytics</span>
                          </Link>
                          <Link
                            to="/admin/communications"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="relative">
                              <MessageSquare className="w-5 h-5" />
                              {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold ring-1 ring-white dark:ring-gray-800">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                            <span>Communications</span>
                          </Link>
                        </>
                      ) : user?.role === 'instructor' ? (
                        <>
                          <Link
                            to="/instructor/dashboard"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <BookOpen className="w-5 h-5" />
                            <span>Instructor Dashboard</span>
                          </Link>
                          <Link
                            to="/instructor/courses"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Play className="w-5 h-5" />
                            <span>My Courses</span>
                          </Link>
                          <Link
                            to="/instructor/analytics"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <TrendingUp className="w-5 h-5" />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            to="/instructor/communications"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="relative">
                              <MessageSquare className="w-5 h-5" />
                              {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold ring-1 ring-white dark:ring-gray-800">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                            <span>Contact Admin</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/my-learning"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <BookOpen className="w-5 h-5" />
                            <span>My Learning</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Heart className="w-5 h-5" />
                            <span>Wishlist</span>
                          </Link>
                          <Link
                            to="/certificates"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Award className="w-5 h-5" />
                            <span>Certificates</span>
                          </Link>
                          <Link
                            to="/student/group-chat"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Users className="w-5 h-5" />
                            <span>Group Chat</span>
                          </Link>
                          <Link
                            to={`/student/progress/${user?.enrolledCourses?.[0]?.id || 'all'}`}
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <BarChart3 className="w-5 h-5" />
                            <span>Track Progress</span>
                          </Link>
                          <Link
                            to="/student/issues"
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>My Issues</span>
                          </Link>
                          <button
                            onClick={() => {
                              setIsReportIssueOpen(true);
                              setIsProfileOpen(false);
                            }}
                            className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg theme-text-primary transition-colors"
                          >
                            <AlertTriangle className="w-5 h-5" />
                            <span>Report Issue</span>
                          </button>
                        </>
                      )}

                      <div className="border-t theme-border my-2"></div>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center space-x-3 w-full p-3 text-left hover:theme-bg-secondary rounded-lg text-red-600 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:theme-bg-secondary active:theme-bg-tertiary active:scale-95 transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMenuOpen && createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer */}
            <div
              ref={menuRef}
              className="fixed inset-y-0 right-0 w-[280px] xs:w-80 theme-card shadow-2xl theme-border border-l transform transition-all duration-300 ease-in-out animate-slide-in-right"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="p-4 border-b theme-border flex justify-between items-center">
                  <span className="font-bold text-lg theme-text-primary">Menu</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5 theme-text-secondary" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
                      <input
                        id="mobile-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2.5 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                      />
                    </div>
                  </form>

                  <nav className="space-y-2">
                    <Link
                      to="/courses"
                      className="flex items-center space-x-3 theme-text-secondary hover:text-primary-600 py-3 px-3 rounded-lg hover:theme-bg-secondary transition-colors group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium">All Courses</span>
                    </Link>

                    {isAuthenticated && user?.role === 'student' && (
                      <>
                        <Link
                          to="/my-learning"
                          className="flex items-center space-x-3 theme-text-secondary hover:text-primary-600 py-3 px-3 rounded-lg hover:theme-bg-secondary transition-colors group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                            <Play className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="font-medium">My Learning</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-3 theme-text-secondary hover:text-primary-600 py-3 px-3 rounded-lg hover:theme-bg-secondary transition-colors group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                            <Heart className="w-5 h-5 text-red-600" />
                          </div>
                          <span className="font-medium">Wishlist</span>
                        </Link>
                        <Link
                          to="/student/group-chat"
                          className="flex items-center space-x-3 theme-text-secondary hover:text-primary-600 py-3 px-3 rounded-lg hover:theme-bg-secondary transition-colors group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="font-medium">Group Chat</span>
                        </Link>
                      </>
                    )}

                    {isAuthenticated && user?.role === 'instructor' && (
                      <>
                        <Link
                          to="/instructor/dashboard"
                          className="flex items-center space-x-3 theme-text-secondary hover:text-primary-600 py-3 px-3 rounded-lg hover:theme-bg-secondary transition-colors group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium">Instructor Dashboard</span>
                        </Link>
                        <Link
                          to="/instructor/courses"
                          className="flex items-center space-x-3 theme-text-secondary hover:text-primary-600 py-3 px-3 rounded-lg hover:theme-bg-secondary transition-colors group"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                            <Play className="w-5 h-5 text-orange-600" />
                          </div>
                          <span className="font-medium">My Courses</span>
                        </Link>
                      </>
                    )}

                    {/* Categories in Mobile */}
                    <div className="border-t theme-border pt-4 mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider theme-text-muted mb-3 px-3">Categories</p>
                      <div className="space-y-1">
                        {categories.slice(0, 8).map((category) => (
                          <Link
                            key={category.name}
                            to={`/courses?category=${encodeURIComponent(category.name.toLowerCase())}`}
                            className="flex items-center space-x-3 py-2 px-3 rounded-lg hover:theme-bg-secondary transition-colors theme-text-secondary hover:text-primary-600"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <category.icon className="w-4 h-4 opacity-70" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <div className="flex flex-col space-y-3 pt-6 mt-2 border-t theme-border">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-center">Log In</Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full justify-center">Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      <ReportIssue
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
      />

    </header>
  );
};

export default Header;