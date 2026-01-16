import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, Video, CheckCircle, Play } from 'lucide-react';
import { API_URL } from '../../config/api';

const RecordingUploader = ({ courseId = null, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('video')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('File size must be less than 500MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (courseId) formData.append('courseId', courseId);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(`${API_URL}/upload/recording`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Reset form immediately after successful upload
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setUploadedFile(null);

      toast.success('Recording uploaded successfully!');

      // Notify parent component to refresh recordings list
      if (onUploadSuccess) {
        onUploadSuccess(result.recording);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload recording');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold theme-text-primary">
          Upload Live Class Recording
        </h3>
      </div>

      {!uploadedFile ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Recording Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter recording title"
                className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter recording description"
                rows={3}
                className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
          </div>

          <div className="border-2 border-dashed theme-border rounded-lg p-6 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="recording-upload"
            />

            <label
              htmlFor="recording-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Upload className="w-12 h-12 theme-text-muted" />
              <div>
                <p className="text-lg font-medium theme-text-primary">
                  {selectedFile ? selectedFile.name : 'Click to select video'}
                </p>
                <p className="text-sm theme-text-muted">
                  Supports: MP4, WebM, AVI (Max: 500MB)
                </p>
                {selectedFile && (
                  <p className="text-sm theme-text-secondary mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      ) : (
        <div className="border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">{uploadedFile.name}</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {formatFileSize(uploadedFile.size)} • Uploaded successfully
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Play className="w-3 h-3" />
              View Recording
            </a>
            <button
              type="button"
              onClick={() => setUploadedFile(null)}
              className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {selectedFile && title.trim() && !uploadedFile && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading to Cloudinary...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Recording
            </>
          )}
        </button>
      )}

      <div className="text-xs theme-text-muted space-y-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <p>• Recordings are automatically available to enrolled students</p>
        <p>• Files are stored securely in the cloud</p>
        <p>• Supported formats: MP4, WebM, AVI, MOV</p>
      </div>
    </div>
  );
};

export default RecordingUploader;