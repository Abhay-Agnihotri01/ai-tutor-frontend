import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, Settings, Users, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const PreJoinRoom = ({ liveClass, userRole, onJoin, onCancel }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Determine role from URL path
  const isInstructorPath = location.pathname.includes('/instructor/');
  const isStudentPath = location.pathname.includes('/student/');
  const effectiveRole = isInstructorPath ? 'instructor' : (isStudentPath ? 'student' : userRole);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Unable to access camera/microphone');
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await onJoin({ video: isVideoEnabled, audio: isAudioEnabled });
    } catch (error) {
      toast.error('Failed to join meeting');
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Video Preview */}
          <div className="lg:w-2/3 bg-gray-900 relative">
            <div className="aspect-video relative">
              {isVideoEnabled && mediaStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-3xl font-bold">
                        {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <p className="text-gray-400">Camera is off</p>
                  </div>
                </div>
              )}
              
              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4 bg-gray-800/80 backdrop-blur-sm rounded-full px-6 py-3">
                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioEnabled 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isVideoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
                  </button>
                  
                  <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Info & Join */}
          <div className="lg:w-1/3 p-8 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {liveClass?.title || 'Live Class'}
                </h1>
                <p className="text-gray-400 mb-4">
                  {liveClass?.courses?.title}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-300">
                    <Clock size={16} className="text-blue-400" />
                    <span>
                      Scheduled: {liveClass?.scheduledAt ? formatTime(liveClass.scheduledAt) : 'Now'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-300">
                    <Users size={16} className="text-green-400" />
                    <span>
                      Joining as {effectiveRole === 'instructor' ? 'Instructor' : 'Student'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-based features */}
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <h3 className="text-white font-semibold mb-3">Your Permissions</h3>
                <div className="space-y-2 text-sm">
                  {effectiveRole === 'instructor' ? (
                    <>
                      <div className="flex items-center space-x-2 text-green-400">
                        <span>✓</span>
                        <span>Camera & Microphone</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <span>✓</span>
                        <span>Screen Sharing</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <span>✓</span>
                        <span>Recording Control</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <span>✓</span>
                        <span>Participant Management</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <span>⚠</span>
                        <span>Listen & View Only</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <span>✗</span>
                        <span>Camera & Microphone (Disabled)</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <span>✗</span>
                        <span>Screen Sharing (Disabled)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-6">
                By joining, you agree to the meeting terms and conditions.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleJoin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <span>Join Meeting</span>
                )}
              </button>
              
              <button
                onClick={onCancel}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreJoinRoom;