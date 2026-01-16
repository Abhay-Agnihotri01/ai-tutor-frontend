import React, { useState, useEffect } from 'react';
import { Play, Trash2, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pagination from '../common/Pagination';
import { API_URL } from '../../config/api';

const RecordingsList = ({ courseId, refreshTrigger }) => {
  const [recordings, setRecordings] = useState([]);
  const [paginatedRecordings, setPaginatedRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    fetchRecordings();
  }, [courseId, refreshTrigger]);

  useEffect(() => {
    paginateRecordings();
  }, [recordings, currentPage]);

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

  const paginateRecordings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRecordings(recordings.slice(startIndex, endIndex));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(recordings.length / itemsPerPage);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <p className="text-sm theme-text-muted text-center py-4">
        No recordings uploaded yet
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedRecordings.filter(recording => recording && recording.id).map((recording) => (
          <div key={recording.id} className="theme-bg-secondary rounded-lg p-4 border theme-border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium theme-text-primary truncate">
                  {recording.title}
                </h4>
                {recording.description && (
                  <p className="text-sm theme-text-muted mt-1 line-clamp-2">
                    {recording.description}
                  </p>
                )}
              </div>
              <a
                href={recording.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                title="View recording"
              >
                <Play className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-4 text-xs theme-text-muted">
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
              {recording.fileSize && (
                <span>{formatFileSize(recording.fileSize)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={recordings.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            size="sm"
            showInfo={false}
          />
        </div>
      )}
    </>
  );
};

export default RecordingsList;