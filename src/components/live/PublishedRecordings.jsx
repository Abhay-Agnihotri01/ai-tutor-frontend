import React, { useState, useEffect } from 'react';
import { Play, Clock, Calendar, FileVideo, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config/api';

const PublishedRecordings = ({ courseId }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchPublishedRecordings();
    }
  }, [courseId]);

  const fetchPublishedRecordings = async () => {
    try {
      const response = await fetch(`${API_URL}/upload/course/${courseId}`);

      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
      } else {
        throw new Error('Failed to fetch recordings');
      }
    } catch (error) {
      console.error('Error fetching published recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayRecording = (recording) => {
    setSelectedRecording(recording);
    setShowVideoModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileVideo className="w-6 h-6" />
            Live Class Recordings
          </h2>
          <p className="text-gray-600 mt-1">
            Watch recorded live classes from this course
          </p>
        </div>
        {recordings.length > 0 && (
          <span className="text-sm text-gray-500">
            {recordings.length} recording{recordings.length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {recordings.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {filteredRecordings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileVideo className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No recordings found' : 'No recordings available'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Live class recordings will appear here once published by your instructor'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <div key={recording.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {recording.thumbnailUrl ? (
                  <img
                    src={recording.thumbnailUrl}
                    alt={recording.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <FileVideo className="w-12 h-12 text-blue-400" />
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all cursor-pointer group"
                  onClick={() => handlePlayRecording(recording)}>
                  <div className="bg-white bg-opacity-90 group-hover:bg-opacity-100 rounded-full p-3 transform group-hover:scale-110 transition-all">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                </div>

                {recording.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(recording.duration)}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {recording.title}
                </h3>

                {recording.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {recording.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>
                      {new Date(recording.uploadedAt || recording.publishedAt).toLocaleDateString()}
                    </span>
                    {recording.fileSize && (
                      <span>{formatFileSize(recording.fileSize)}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePlayRecording(recording)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Watch Recording
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showVideoModal && selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedRecording.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Uploaded: {new Date(selectedRecording.uploadedAt || selectedRecording.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="aspect-video bg-black">
              {selectedRecording.cloudinaryUrl && (
                <video
                  src={selectedRecording.cloudinaryUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={selectedRecording.thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {selectedRecording.description && (
              <div className="p-4 border-t bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {selectedRecording.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishedRecordings;