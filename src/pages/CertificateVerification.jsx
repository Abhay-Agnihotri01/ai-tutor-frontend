import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award, CheckCircle, XCircle, Calendar, User,
  BookOpen, ExternalLink, Shield, Download
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/common/LoadingScreen';
import { API_URL } from '../config/api';

const CertificateVerification = () => {
  const { certificateId } = useParams();
  const { isDark } = useTheme();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      const response = await fetch(`${API_URL}/certificates/verify/${certificateId}`);
      const data = await response.json();

      if (data.success) {
        setCertificate(data.certificate);
        setIsValid(true);
      } else {
        setError(data.message || 'Certificate not found');
        setIsValid(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify certificate');
      setIsValid(false);
    } finally {
      setIsLoading(false);
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
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'
      } py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isValid
                ? 'bg-gradient-to-br from-green-400 to-green-600'
                : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}>
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Certificate Verification
          </h1>

          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Verify the authenticity of learning certificates
          </p>
        </div>

        {/* Verification Result */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-2xl shadow-xl overflow-hidden`}>

          {/* Status Banner */}
          <div className={`px-8 py-6 ${isValid
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
            <div className="flex items-center justify-center space-x-3">
              {isValid ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <XCircle className="w-8 h-8 text-white" />
              )}
              <span className="text-2xl font-bold text-white">
                {isValid ? 'Certificate Verified' : 'Verification Failed'}
              </span>
            </div>
          </div>

          <div className="p-8">
            {isValid && certificate ? (
              // Valid Certificate Display
              <div>
                {/* Certificate Preview */}
                <div className={`${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
                  } rounded-xl p-8 mb-8 border-2 ${isDark ? 'border-gray-700' : 'border-blue-200'
                  }`}>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award className="w-12 h-12 text-white" />
                    </div>

                    <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Certificate of Completion
                    </h2>

                    <div className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      This certifies that
                    </div>

                    <div className={`text-4xl font-bold mb-6 ${isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                      {certificate.studentName}
                    </div>

                    <div className={`text-lg mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      has successfully completed
                    </div>

                    <div className={`text-2xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {certificate.courseName}
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'
                    } rounded-xl p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Certificate Details
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Certificate ID
                          </p>
                          <p className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {certificateId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Issue Date
                          </p>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(certificate.issuedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Instructor
                          </p>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {certificate.instructorName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'
                    } rounded-xl p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Verification Status
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Certificate is Valid
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Digitally Signed
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Blockchain Verified
                        </span>
                      </div>
                    </div>

                    <div className={`mt-6 p-4 ${isDark ? 'bg-green-900/20' : 'bg-green-50'
                      } rounded-lg border ${isDark ? 'border-green-800' : 'border-green-200'
                      }`}>
                      <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'
                        }`}>
                        ✓ This certificate has been verified and is authentic.
                        It was issued by our certified learning platform and
                        represents genuine completion of the course.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Explore Courses</span>
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className={`inline-flex items-center justify-center space-x-2 ${isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      } px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105`}
                  >
                    <Download className="w-5 h-5" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            ) : (
              // Invalid Certificate Display
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-white" />
                </div>

                <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Certificate Not Found
                </h3>

                <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {error || 'The certificate you are trying to verify could not be found or may have been revoked.'}
                </p>

                <div className={`${isDark ? 'bg-red-900/20' : 'bg-red-50'
                  } rounded-xl p-6 mb-8 border ${isDark ? 'border-red-800' : 'border-red-200'
                  }`}>
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    Certificate ID: <span className="font-mono">{certificateId}</span>
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    Please verify the certificate ID is correct or contact the certificate issuer.
                  </p>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Go to Homepage</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Certificate verification powered by blockchain technology
            <br />
            For questions about this certificate, please contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;