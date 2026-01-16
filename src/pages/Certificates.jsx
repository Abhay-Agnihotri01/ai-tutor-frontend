import React, { useState, useEffect } from 'react';
import { Award, Download, Share2, Calendar, ExternalLink, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Skeleton } from '../components/common/Skeleton';
import toast from 'react-hot-toast';
import { API_URL } from '../config/api';

const Certificates = () => {
  const { isDark } = useTheme();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`${API_URL}/certificates/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = async (certificate) => {
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
      link.download = `Certificate-${certificate.courses.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async (certificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate.courses.title}`,
          text: `I've completed ${certificate.courses.title} and earned this certificate!`,
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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-6">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                My Certificates
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your earned course completion certificates
              </p>
            </div>
          </div>
        </div>

        {certificates.length === 0 ? (
          /* Empty State */
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center`}>
            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Certificates Yet
            </h3>
            <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete courses to earn certificates and showcase your achievements!
            </p>
            <a
              href="/courses"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Browse Courses</span>
            </a>
          </div>
        ) : (
          /* Certificates Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Certificate of Completion
                  </h3>
                  <p className="text-white/80 text-sm">
                    {certificate.courses.title}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Issued Date
                        </p>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(certificate.issuedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-green-500" />
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Certificate ID
                        </p>
                        <p className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {certificate.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => downloadCertificate(certificate)}
                      className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => shareCertificate(certificate)}
                      className={`flex items-center justify-center p-2 ${isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        } rounded-lg transition-colors duration-200`}
                      title="Share Certificate"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <a
                      href={`/verify-certificate/${certificate.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                      title="View Certificate"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;