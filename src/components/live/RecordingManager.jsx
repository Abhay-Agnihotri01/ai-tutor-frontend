import React, { useState, useEffect } from 'react';
import { Play, Download, Edit, Trash2, Upload, Eye, Clock, FileVideo } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../config/api';

const RecordingManager = ({ liveClassId, isInstructor = false }) => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchRecordings();
  }, [liveClassId]);

  const fetchRecordings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live-classes/${liveClassId}/recordings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (recordingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live-classes/recordings/${recordingId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        window.open(data.downloadUrl, '_blank');
        toast.success('Download started');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error(error.message || 'Failed to download recording');
    }
  };

  const handlePublish = async (recordingId, publishData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live-classes/recordings/${recordingId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });

      if (response.ok) {
        toast.success('Recording published successfully');
        fetchRecordings();
        setShowPublishModal(false);
      } else {
        throw new Error('Publish failed');
      }
    } catch (error) {
      console.error('Error publishing recording:', error);
      toast.error('Failed to publish recording');
    }
  };

  const handleUpdate = async (recordingId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live-classes/recordings/${recordingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        toast.success('Recording updated successfully');
        fetchRecordings();
        setShowEditModal(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating recording:', error);
      toast.error('Failed to update recording');
    }
  };

  const handleDelete = async (recordingId) => {
    if (!confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/live-classes/recordings/${recordingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Recording deleted successfully');
        fetchRecordings();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'ready': return 'text-blue-600 bg-blue-100';
      case 'published': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileVideo className="w-5 h-5" />
          Class Recordings
        </h3>
        {recordings.length > 0 && (
          <span className="text-sm text-gray-500">
            {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileVideo className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recordings available</p>
          {isInstructor && (
            <p className="text-sm mt-1">Start recording during live classes to see them here</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div key={recording.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{recording.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recording.status)}`}>
                      {recording.status}
                    </span>
                    {recording.isPublished && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                        Published
                      </span>
                    )}
                  </div>

                  {recording.description && (
                    <p className="text-sm text-gray-600 mb-2">{recording.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {recording.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(recording.duration)}
                      </span>
                    )}
                    {recording.fileSize && (
                      <span>{formatFileSize(recording.fileSize)}</span>
                    )}
                    <span>
                      Created {new Date(recording.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Student view - only published recordings */}
                  {!isInstructor && recording.isPublished && recording.cloudinaryUrl && (
                    <button
                      onClick={() => window.open(recording.cloudinaryUrl, '_blank')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Watch recording"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {/* Instructor view - all recordings with management options */}
                  {isInstructor && (
                    <>
                      {recording.cloudinaryUrl && (
                        <button
                          onClick={() => window.open(recording.cloudinaryUrl, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Watch recording"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}

                      {recording.status === 'ready' && (
                        <button
                          onClick={() => handleDownload(recording.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download for editing"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedRecording(recording);
                          setEditForm({ title: recording.title, description: recording.description || '' });
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {recording.status === 'ready' && !recording.isPublished && (
                        <button
                          onClick={() => {
                            setSelectedRecording(recording);
                            setEditForm({ title: recording.title, description: recording.description || '' });
                            setShowPublishModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Publish recording"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(recording.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Recording</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(selectedRecording.id, editForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Publish Recording</h3>
            <p className="text-sm text-gray-600 mb-4">
              Publishing will upload the recording to cloud storage and make it available to students.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePublish(selectedRecording.id, editForm)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Publish Recording
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingManager;