import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

const JitsiMeeting = ({ meetingConfig, onMeetingEnd, onRecordingStart, onRecordingStop }) => {
  const jitsiContainerRef = useRef(null);
  const [api, setApi] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [meetingJoined, setMeetingJoined] = useState(false);


  useEffect(() => {
    if (!meetingConfig || !jitsiContainerRef.current) return;

    let jitsiApi = null;
    let script = null;

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');

    const initializeJitsi = () => {
      if (!window.JitsiMeetExternalAPI || jitsiApi) return;

      const options = {
        roomName: meetingConfig.roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: meetingConfig.userInfo,
        jwt: meetingConfig.jwt || undefined,
        configOverwrite: {
          ...meetingConfig.configOverwrite,
          prejoinPageEnabled: false,
          requireDisplayName: false,
          enableUserRolesBasedOnToken: false,
          disableProfile: true,
          hideDisplayName: false,
          readOnlyName: false,
          enableLobbyChat: false,
          disableModeratorIndicator: true,
          enableAuthenticationUI: false
        },
        interfaceConfigOverwrite: meetingConfig.interfaceConfigOverwrite
      };

      jitsiApi = new window.JitsiMeetExternalAPI(meetingConfig.domain, options);
      setApi(jitsiApi);

      // Event listeners
      jitsiApi.addEventListener('videoConferenceJoined', () => {
        console.log('Joined the meeting');
        setMeetingJoined(true);
        toast.success('Joined the live class successfully!');
      });

      jitsiApi.addEventListener('videoConferenceLeft', () => {
        console.log('Left the meeting');
        if (onMeetingEnd) onMeetingEnd();
      });

      // Also listen for readyToClose event as backup
      jitsiApi.addEventListener('readyToClose', () => {
        console.log('Meeting ready to close');
        if (onMeetingEnd) onMeetingEnd();
      });

      // Listen for hangup button click
      jitsiApi.addEventListener('toolbarButtonClicked', (event) => {
        if (event.key === 'hangup') {
          console.log('Hangup button clicked');
          setTimeout(() => {
            if (onMeetingEnd) onMeetingEnd();
          }, 500);
        }
      });

      jitsiApi.addEventListener('recordingStatusChanged', (event) => {
        console.log('Recording status changed:', event);
        const recording = event.on;
        const wasRecording = isRecording;

        setIsRecording(recording);

        // Only show toast if meeting has been joined and there was an actual state change
        if (meetingJoined) {
          if (recording && !wasRecording) {
            toast.success('Recording started');
            if (onRecordingStart) onRecordingStart();
          } else if (!recording && wasRecording) {
            toast.success('Recording stopped');
            if (onRecordingStop) onRecordingStop();
          }
        }
      });

      jitsiApi.addEventListener('participantJoined', (participant) => {
        console.log('Participant joined:', participant);
      });

      jitsiApi.addEventListener('participantLeft', (participant) => {
        console.log('Participant left:', participant);
      });
    };

    if (existingScript) {
      // Script already loaded
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
      } else {
        existingScript.onload = initializeJitsi;
      }
    } else {
      // Load script for first time
      script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initializeJitsi;
      document.head.appendChild(script);
    }

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
        jitsiApi = null;
      }
      setApi(null);
      // Don't remove script as other components might use it
    };
  }, [meetingConfig?.roomName]); // Only re-run when room name changes







  return (
    <div
      className="w-full h-full"
      style={{
        margin: 0,
        padding: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div
        ref={jitsiContainerRef}
        className="w-full flex-1"
        style={{
          margin: 0,
          padding: 0,
          height: '100%',
          width: '100%',
          minHeight: 0,
          flex: '1 1 auto',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default JitsiMeeting;