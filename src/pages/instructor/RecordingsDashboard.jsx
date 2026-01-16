import React, { useState, useEffect } from 'react';
import { 
  FileVideo, 
  Play, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Filter,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RecordingsDashboard = () => {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchRecordings();
  }, [filter]);

  const fetchRecordings = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? '/api/live-classes/instructor/recordings'
        : `/api/live-classes/instructor/recordings?status=${filter}`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings);
      } else {
        throw new Error('Failed to fetch recordings');
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
      const response = await fetch(`/api/live-classes/recordings/${recordingId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error('Failed to download recording');
    }
  };

  const handlePublish = async (recordingId, publishData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/live-classes/recordings/${recordingId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });
      
      if (response.ok) {
        toast.success('Recording is being published to cloud storage...');
        fetchRecordings();
        setShowPublishModal(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Publish failed');
      }
    } catch (error) {
      console.error('Error publishing recording:', error);
      toast.error(error.message || 'Failed to publish recording');
    }
  };

  const handleUpdate = async (recordingId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/live-classes/recordings/${recordingId}`, {
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
      const response = await fetch(`/api/live-classes/recordings/${recordingId}`, {
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

  const filteredRecordings = recordings.filter(recording => 
    recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.live_classes?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.live_classes?.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusCounts = () => {
    return {
      all: recordings.length,
      processing: recordings.filter(r => r.status === 'processing').length,
      ready: recordings.filter(r => r.status === 'ready').length,
      published: recordings.filter(r => r.status === 'published').length,
      failed: recordings.filter(r => r.status === 'failed').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recording Management</h1>
          <p className="text-gray-600">Manage your live class recordings, download for editing, and publish for students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'all', label: 'Total', count: statusCounts.all, color: 'bg-gray-100 text-gray-800' },
            { key: 'processing', label: 'Processing', count: statusCounts.processing, color: 'bg-yellow-100 text-yellow-800' },
            { key: 'ready', label: 'Ready', count: statusCounts.ready, color: 'bg-blue-100 text-blue-800' },
            { key: 'published', label: 'Published', count: statusCounts.published, color: 'bg-green-100 text-green-800' },
            { key: 'failed', label: 'Failed', count: statusCounts.failed, color: 'bg-red-100 text-red-800' }
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                filter === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${color} mb-1`}>
                  {label}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search recordings, classes, or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {filteredRecordings.length === 0 ? (
            <div className="text-center py-12">
              <FileVideo className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Start recording live classes to see them here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRecordings.map((recording) => (
                <div key={recording.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{recording.title}</h3>
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
                        <p className="text-gray-600 mb-3">{recording.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {recording.live_classes && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {recording.live_classes.title}
                          </span>
                        )}
                        {recording.live_classes?.courses && (
                          <span>Course: {recording.live_classes.courses.title}</span>
                        )}
                        {recording.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(recording.duration)}
                          </span>
                        )}
                        {recording.fileSize && (
                          <span>{formatFileSize(recording.fileSize)}</span>
                        )}
                        <span>
                          Created {new Date(recording.createdAt).toLocaleDateString()}
                        </span>
                        {recording.publishedAt && (
                          <span>
                            Published {new Date(recording.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-6">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

      {showPublishModal && selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Publish Recording</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Publishing will:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                <li>Upload the recording to cloud storage</li>
                <li>Make it available to enrolled students</li>
                <li>Generate a thumbnail for the video</li>
              </ul>
            </div>
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
                  placeholder="Add a description to help students understand the content..."
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

export default RecordingsDashboard;