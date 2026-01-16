import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, RotateCcw, RotateCw 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useProgressTracking } from '../../hooks/useProgressTracking';

const SPEED_OPTIONS = [
  { value: 0.25, label: '0.25x', shortcut: null },
  { value: 0.5, label: '0.5x', shortcut: '1' },
  { value: 0.75, label: '0.75x', shortcut: '2' },
  { value: 1, label: 'Normal', shortcut: '3' },
  { value: 1.25, label: '1.25x', shortcut: '4' },
  { value: 1.5, label: '1.5x', shortcut: '5' },
  { value: 1.75, label: '1.75x', shortcut: '6' },
  { value: 2, label: '2x', shortcut: '7' }
];

const QUALITY_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '1080p', label: '1080p HD' },
  { value: '720p', label: '720p HD' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' }
];

const AdvancedVideoPlayer = ({ 
  src, 
  poster, 
  onTimeUpdate, 
  onProgress, 
  onEnded,
  initialTime = 0,
  className = "",
  videoId,
  courseId
}) => {
  const { isDark } = useTheme();
  const { updateLectureProgress } = useProgressTracking();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Progress tracking
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const progressUpdateInterval = useRef(null);

  // Update progress every 10 seconds
  const updateProgress = useCallback(async (currentTime, duration) => {
    if (!videoId || !courseId || !duration) return;
    await updateLectureProgress(courseId, videoId, currentTime, duration);
  }, [videoId, courseId, updateLectureProgress]);

  // Start progress tracking when video plays
  useEffect(() => {
    if (isPlaying && videoId && courseId) {
      progressUpdateInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;
          
          // Only update if significant time has passed
          if (currentTime - lastProgressUpdate >= 10) {
            updateProgress(currentTime, duration);
            setLastProgressUpdate(currentTime);
          }
        }
      }, 10000); // Update every 10 seconds
    } else {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [isPlaying, videoId, courseId, updateProgress, lastProgressUpdate]);
  
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!videoRef.current || !containerRef.current) return;
      
      // Skip if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      
      // Only handle keys if the video player container is focused or if it's a global shortcut
      const isVideoFocused = containerRef.current.contains(document.activeElement) || 
                            document.activeElement === containerRef.current ||
                            document.activeElement === videoRef.current;
      
      if (!isVideoFocused && e.key !== ' ') return;
      
      switch(e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
          e.preventDefault();
          const speed = SPEED_OPTIONS.find(s => s.shortcut === e.key);
          if (speed) changePlaybackRate(speed.value);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
      
      // Update progress on significant time changes
      if (videoId && courseId && time - lastProgressUpdate >= 30) {
        updateProgress(time, videoRef.current.duration);
        setLastProgressUpdate(time);
      }
    }
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const duration = videoRef.current.duration;
      setBuffered((bufferedEnd / duration) * 100);
      onProgress?.(bufferedEnd / duration);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Log activity when video starts
    if (videoId && courseId && videoRef.current) {
      updateProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };
  const handlePause = () => {
    setIsPlaying(false);
    // Update progress when paused
    if (videoId && courseId && videoRef.current) {
      updateProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };
  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  // Control functions
  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    try {
      if (videoRef.current.paused || videoRef.current.ended) {
        await videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  const skipBackward = () => {
    if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration || duration;
      videoRef.current.currentTime = Math.min(videoDuration, videoRef.current.currentTime + 10);
    }
  };

  const adjustVolume = (delta) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !videoRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeClick = (e) => {
    if (!volumeRef.current || !videoRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = clickX / rect.width;
    
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
      onFocus={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 pointer-events-auto"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <div className="pointer-events-auto">
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              ref={progressRef}
              className="relative h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all duration-200 pointer-events-auto"
              onClick={handleProgressClick}
            >
              {/* Buffered Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Current Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              {/* Progress Handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200"
                style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-8px' }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors duration-200"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="text-white hover:text-blue-400 transition-colors duration-200"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="text-white hover:text-blue-400 transition-colors duration-200"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-blue-400 transition-colors duration-200"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
                <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                  <div 
                    ref={volumeRef}
                    className="h-1 bg-white/20 rounded-full cursor-pointer"
                    onClick={handleVolumeClick}
                  >
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Time Display */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`text-white hover:text-blue-400 transition-colors duration-200 flex items-center space-x-1 ${
                    playbackRate !== 1 ? 'text-blue-400' : ''
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">{playbackRate}x</span>
                </button>

                {/* Settings Dropdown */}
                {showSettings && (
                  <div className={`absolute bottom-full right-0 mb-2 ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } rounded-lg shadow-xl border ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  } py-2 min-w-[120px]`}>
                    <div className={`px-3 py-1 text-xs font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    } border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      Playback Speed
                    </div>
                    {SPEED_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => changePlaybackRate(option.value)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center justify-between ${
                          playbackRate === option.value 
                            ? 'text-blue-600 bg-blue-50' 
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        <span>{option.label}</span>
                        {option.shortcut && (
                          <span className="text-xs opacity-60">{option.shortcut}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-400 transition-colors duration-200"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className={`${
          isDark ? 'bg-gray-800/90' : 'bg-white/90'
        } rounded-lg p-2 text-xs ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <div>Space: Play/Pause</div>
          <div>← →: Skip 10s</div>
          <div>1-7: Speed</div>
          <div>F: Fullscreen</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVideoPlayer;