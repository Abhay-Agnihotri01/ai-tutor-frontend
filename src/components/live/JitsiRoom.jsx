import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

import JitsiMeeting from '../JitsiMeeting';
import { API_URL } from '../../config/api';

const JitsiRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [meetingConfig, setMeetingConfig] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [liveClass, setLiveClass] = useState(null);
  const [userRole, setUserRole] = useState('participant');

  const [meetingDuration, setMeetingDuration] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setMeetingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    // Check for admin access from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';
    const adminName = urlParams.get('name');
    const jwt = urlParams.get('jwt');

    if (isAdmin && adminName) {
      // Admin access - bypass normal flow completely
      setUserRole('admin');
      setLiveClass({ title: 'Admin Monitoring', meetingId });
      setMeetingConfig({
        roomName: meetingId,
        domain: '8x8.vc',
        userInfo: {
          displayName: decodeURIComponent(adminName),
          email: 'admin@monitor.local'
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          requireDisplayName: false,
          enableLobbyChat: false,
          enableUserRolesBasedOnToken: false,
          disableModeratorIndicator: false,
          enableAuthenticationUI: false,
          enableClosePage: false
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      });
      setConnecting(false);
      return;
    }

    // Only fetch live class info if not admin
    if (!isAdmin) {
      fetchLiveClassInfo();
    }

    // Disable scrollbar for live class
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      // Re-enable scrollbar when leaving
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [meetingId, user]);

  const fetchLiveClassInfo = async () => {
    try {
      // Check if this is admin access first
      const urlParams = new URLSearchParams(window.location.search);
      const isAdmin = urlParams.get('admin') === 'true';

      if (isAdmin) {
        // Skip authentication for admin
        return;
      }

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

      // Load meeting config immediately after getting live class info
      await loadMeetingConfig();
    } catch (error) {
      console.error('Error fetching live class:', error);
      toast.error(error.message || 'Failed to load live class');
      navigate('/dashboard');
    } finally {
      setConnecting(false);
    }
  };

  const loadMeetingConfig = async () => {
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
    } catch (error) {
      console.error('Error loading meeting config:', error);
      toast.error(error.message || 'Failed to load meeting');
      navigate('/dashboard');
    }
  };



  const handleDisconnected = () => {
    console.log('Jitsi meeting ended, redirecting to thank you page');
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

  // If meetingUrl is provided, redirect to direct Jitsi URL
  if (meetingConfig.meetingUrl) {
    window.location.href = meetingConfig.meetingUrl;
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Redirecting to live class...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-black"
      style={{
        height: 'calc(100vh - 64px)',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 64px)'
      }}
    >
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

// Chat and participants are now handled by Jitsi's built-in features

export default JitsiRoom;