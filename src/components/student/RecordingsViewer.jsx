import React, { useState, useEffect } from 'react';
import { Play, Calendar, Clock, Video } from 'lucide-react';
import { API_URL } from '../../config/api';
import { toast } from 'react-hot-toast';

const RecordingsViewer = ({ courseId, onSelectRecording }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchRecordings();
    }
  }, [courseId]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch(`${API_URL}/upload/course/${courseId}`);

      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-3 theme-bg-secondary rounded w-20"></div>
        <div className="h-8 theme-bg-secondary rounded"></div>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-4">
        <Video className="w-8 h-8 theme-text-muted mx-auto mb-2" />
        <p className="text-xs theme-text-muted">No recordings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Video className="w-4 h-4 theme-text-muted" />
        <span className="text-sm font-medium theme-text-primary">Recordings ({recordings.length})</span>
      </div>

      <div className="space-y-1">
        {recordings.map((recording) => (
          <div key={recording.id} className="theme-bg-secondary rounded-lg p-3 border theme-border hover:theme-bg-tertiary transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-red-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium theme-text-primary truncate mb-1" title={recording.title}>
                  {recording.title}
                </h4>

                <div className="flex items-center gap-3 text-xs theme-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(recording.uploadedAt).toLocaleDateString()}
                  </span>

                  {recording.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(recording.duration)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelectRecording && onSelectRecording({
                    id: recording.publicId || recording.id,
                    recordingId: recording.publicId || recording.id, // Original recording ID for notes
                    title: recording.title,
                    videoUrl: recording.cloudinaryUrl,
                    description: recording.description || 'Live class recording',
                    duration: recording.duration,
                    contentType: 'recording'
                  })}
                  className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 px-3 rounded transition-colors flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Watch Recording
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingsViewer;