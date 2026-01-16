import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera, CameraOff, Mic, MicOff, PhoneOff, Users,
  MessageCircle, Monitor, MonitorOff, Copy, Clock,
  Crown, GraduationCap, X, Send, UserX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import PreJoinRoom from './PreJoinRoom';
import JitsiMeeting from '../JitsiMeeting';
import { API_URL } from '../../config/api';

const LiveClassRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [meetingConfig, setMeetingConfig] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [liveClass, setLiveClass] = useState(null);
  const [userRole, setUserRole] = useState('participant');
  const [hasJoined, setHasJoined] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setMeetingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    fetchLiveClassInfo();
  }, [meetingId, user]);

  const fetchLiveClassInfo = async () => {
    try {
      const classResponse = await fetch(`${API_URL}/live-classes/meeting/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!classResponse.ok) {
        throw new Error('Live class not found');
      }

      const classData = await classResponse.json();
      setLiveClass(classData.liveClass);
      setUserRole(classData.liveClass.userRole);
    } catch (error) {
      console.error('Error fetching live class:', error);
      toast.error(error.message || 'Failed to load live class');
      navigate('/dashboard');
    } finally {
      setConnecting(false);
    }
  };

  const handleJoinMeeting = async (mediaSettings) => {
    try {
      const configResponse = await fetch(`${API_URL}/live-classes/token/${meetingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!configResponse.ok) {
        const errorData = await configResponse.json();
        throw new Error(errorData.message || 'Failed to join live class');
      }

      const configData = await configResponse.json();
      setMeetingConfig(configData.meetingConfig);
      setUserRole(configData.role);
      setHasJoined(true);
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error(error.message || 'Failed to join meeting');
      throw error;
    }
  };

  const handleCancelJoin = () => {
    navigate('/dashboard');
  };

  const handleDisconnected = () => {
    console.log('Meeting disconnected, redirecting to thank you page');
    navigate('/live-class/thank-you', {
      state: {
        liveClass,
        userRole,
        duration: meetingDuration
      }
    });
  };

  const copyMeetingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied to clipboard');
  };

  if (connecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading live class...</p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <PreJoinRoom
        liveClass={liveClass}
        userRole={userRole}
        onJoin={handleJoinMeeting}
        onCancel={handleCancelJoin}
      />
    );
  }

  if (!meetingConfig) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Failed to connect to live class</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`} style={{ height: 'calc(100vh - 64px)' }}>
      <JitsiMeeting
        meetingConfig={meetingConfig}
        onMeetingEnd={handleDisconnected}
        onRecordingStart={() => {
          toast.success('Recording started');
        }}
        onRecordingStop={() => {
          toast.success('Recording stopped');
        }}
      />
    </div>
  );
};

// Removed ModernVideoInterface - now handled by JitsiMeeting component

// Chat and participants are now handled by Jitsi's built-in features

export default LiveClassRoom;