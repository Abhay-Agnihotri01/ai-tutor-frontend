import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LiveClassThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(10);
  
  // Get class info from navigation state
  const { liveClass, duration, userRole } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const redirectPath = userRole === 'instructor' ? '/instructor/dashboard' : '/my-learning';
          navigate(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userRole]);

  const handleGoToDashboard = () => {
    const redirectPath = userRole === 'instructor' ? '/instructor/dashboard' : '/my-learning';
    navigate(redirectPath);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Thank You Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanks for joining!
        </h1>
        
        <p className="text-gray-600 mb-6">
          {userRole === 'instructor' 
            ? "Your live class session has ended successfully."
            : "Hope you enjoyed the live class session."
          }
        </p>

        {/* Class Summary */}
        {liveClass && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">{liveClass.title}</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              {duration && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {formatDuration(duration)}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Role: {userRole === 'instructor' ? 'Instructor' : 'Student'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Rating Prompt for Students */}
        {userRole === 'student' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Rate this session</span>
            </div>
            <p className="text-blue-700 text-sm">
              Your feedback helps improve future classes
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting automatically in {countdown} seconds
          </p>
        </div>

        {/* Footer Message */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {userRole === 'instructor' 
              ? "Class recordings and analytics will be available in your instructor dashboard."
              : "Continue learning with more courses and live sessions."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveClassThankYou;