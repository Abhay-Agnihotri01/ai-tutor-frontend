import React, { useState } from 'react';
import { 
  Trophy, Award, Star, Download, Share2, 
  CheckCircle, Sparkles, X 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import CertificateModal from '../common/CertificateModal';
import toast from 'react-hot-toast';

const CourseCompletionModal = ({ 
  isOpen, 
  onClose, 
  course, 
  completionStats 
}) => {
  const { isDark } = useTheme();
  const [showCertificate, setShowCertificate] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);

  if (!isOpen) return null;

  const handleGetCertificate = () => {
    setShowCertificate(true);
  };

  const handleShare = async () => {
    const shareText = `🎉 I just completed "${course?.title}" on LearnHub! 
    
📊 My Stats:
• ${completionStats?.videosWatched || 0} videos watched
• ${completionStats?.quizzesCompleted || 0} quizzes completed  
• ${completionStats?.timeSpent || 0} hours of learning

Ready to start your learning journey? Check it out! 👇`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Course Completed - ${course?.title}`,
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Achievement shared to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative`}>
          
          {/* Confetti Animation */}
          {confettiActive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  <Sparkles 
                    className={`w-4 h-4 ${
                      ['text-yellow-400', 'text-blue-400', 'text-green-400', 'text-purple-400', 'text-pink-400'][Math.floor(Math.random() * 5)]
                    }`} 
                  />
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 z-10 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center pt-12 pb-8 px-8">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent`}>
              Congratulations! 🎉
            </h1>
            
            <p className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              You've successfully completed
            </p>
            
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {course?.title}
            </h2>

            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
            }`}>
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold">Course Completed!</span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-8 mb-8">
            <div className={`${
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            } rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 text-center ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Your Learning Journey
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {completionStats?.videosWatched || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Videos Watched
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {completionStats?.quizzesCompleted || 0}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Quizzes Completed
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {completionStats?.timeSpent || 0}h
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Time Invested
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="px-8 mb-8">
            <h3 className={`text-lg font-semibold mb-4 text-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Achievements Unlocked
            </h3>
            
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Course Master
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-2">
                  <Star className="w-8 h-8 text-white fill-current" />
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Knowledge Seeker
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-2">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Certified Learner
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleGetCertificate}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Award className="w-5 h-5" />
                <span>Get Certificate</span>
              </button>

              <button
                onClick={handleShare}
                className={`flex items-center justify-center space-x-2 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } px-6 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105`}
              >
                <Share2 className="w-5 h-5" />
                <span>Share Achievement</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                🎯 Ready for your next challenge? 
                <br />
                Explore more courses to continue your learning journey!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        courseId={course?.id}
        courseName={course?.title}
        onGenerate={(certificate) => {
          toast.success('🎉 Certificate generated successfully!');
        }}
      />
    </>
  );
};

export default CourseCompletionModal;