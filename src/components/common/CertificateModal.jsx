import React, { useState, useEffect } from 'react';
import {
  X, Download, Share2, Award, Calendar, User,
  BookOpen, CheckCircle, ExternalLink, Copy
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/api';

const CertificateModal = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  onGenerate
}) => {
  const { isDark } = useTheme();
  const [certificate, setCertificate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      checkExistingCertificate();
    }
  }, [isOpen, courseId]);

  const checkExistingCertificate = async () => {
    try {
      const response = await fetch(`${API_URL}/certificates/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.certificate) {
          setCertificate(data.certificate);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const generateCertificate = async () => {
    setIsGenerating(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Authentication required. Please log in again.');
        setIsGenerating(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_URL}/certificates/generate/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.success) {
        setCertificate(data.certificate);
        toast.success('Certificate generated successfully!');
        onGenerate?.(data.certificate);
      } else {
        toast.error(data.message || 'Failed to generate certificate');
      }

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check if the server is running.');
      } else if (error.message.includes('JSON')) {
        toast.error('Server returned invalid response. Please try again.');
      } else {
        toast.error('Failed to generate certificate. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteCertificate = async () => {
    if (!certificate) return;

    try {
      const response = await fetch(`${API_URL}/certificates/delete/${certificate.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCertificate(null);
        toast.success('Old certificate deleted. Generate a new one!');
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    try {
      const response = await fetch(`${API_URL}/certificates/download/${certificate.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${courseName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async () => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${courseName}`,
          text: `I've completed ${courseName} and earned this certificate!`,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Certificate link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Certificate
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {courseName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!certificate ? (
            // Generate Certificate Section
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>

              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Congratulations! 🎉
              </h3>

              <p className={`text-base mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                You've completed this course. Generate your certificate!
              </p>

              <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 mb-4`}>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Course Completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      100% Progress
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={generateCertificate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Certificate...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Generate Certificate</span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            // Certificate Details Section
            <div>
              {/* Certificate Preview */}
              <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'
                } rounded-xl p-4 mb-4 border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'
                }`}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>

                  <h4 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Certificate of Completion
                  </h4>

                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ID: {certificate.id}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Issued: {formatDate(certificate.issuedAt)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-green-500" />
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={downloadCertificate}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={shareCertificate}
                  className={`flex items-center justify-center space-x-2 ${isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105`}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Certificate</span>
                </button>

                <button
                  onClick={deleteCertificate}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <X className="w-5 h-5" />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Verification Link */}
              <div className={`mt-4 p-3 ${isDark ? 'bg-gray-900' : 'bg-blue-50'
                } rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Verification Link - Share to verify certificate
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/verify-certificate/${certificate.id}`)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-3 text-center">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Digitally signed certificate - Share on LinkedIn or add to your portfolio!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;