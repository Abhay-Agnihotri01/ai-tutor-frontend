import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Video, FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../config/api';

const LiveClassScheduler = ({ courseId, courseTitle, liveClass, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 50,
    isRecorded: false
  });
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    if (liveClass) {
      setFormData({
        title: liveClass.title || '',
        description: liveClass.description || '',
        scheduledAt: liveClass.scheduledAt ? new Date(liveClass.scheduledAt).toISOString().slice(0, 16) : '',
        duration: liveClass.duration || 60,
        maxParticipants: liveClass.maxParticipants || 50,
        isRecorded: liveClass.isRecorded || false
      });
    }
    fetchChapters();
  }, [liveClass, courseId]);

  const fetchChapters = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}/chapters`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = liveClass
        ? `${API_URL}/live-classes/${liveClass.id}`
        : `${API_URL}/live-classes`;

      const method = liveClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          courseId,
          scheduledAt: new Date(formData.scheduledAt).toISOString()
        })
      });

      if (response.ok) {
        toast.success(liveClass ? 'Live class updated successfully' : 'Live class scheduled successfully');
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save live class');
      }
    } catch (error) {
      console.error('Error saving live class:', error);
      toast.error(error.message || 'Failed to save live class');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Set minimum date to current date/time
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="theme-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b theme-border">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold theme-text-primary">
                {liveClass ? 'Edit Live Class' : 'Schedule Live Class'}
              </h2>
              <p className="text-sm theme-text-secondary mt-1">
                {courseTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="theme-text-muted hover:theme-text-primary transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Class Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border theme-border theme-bg-secondary theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter class title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border theme-border theme-bg-secondary theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter class description (optional)"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Calendar size={16} className="inline mr-1" />
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                min={getMinDateTime()}
                required
                className="w-full px-3 py-2 border theme-border theme-bg-secondary theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                <Clock size={16} className="inline mr-1" />
                Duration (minutes) *
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border theme-border theme-bg-secondary theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              <Users size={16} className="inline mr-1" />
              Maximum Participants
            </label>
            <select
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              className="w-full px-3 py-2 border theme-border theme-bg-secondary theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={10}>10 participants</option>
              <option value={25}>25 participants</option>
              <option value={50}>50 participants</option>
              <option value={100}>100 participants</option>
              <option value={200}>200 participants</option>
            </select>
          </div>

          {/* Recording Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isRecorded"
              name="isRecorded"
              checked={formData.isRecorded}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border theme-border rounded focus:ring-primary-500"
            />
            <label htmlFor="isRecorded" className="flex items-center text-sm font-medium theme-text-primary">
              <Video size={16} className="mr-1" />
              Record this live class
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileText size={16} className="text-primary-600 mt-0.5" />
              <div className="text-sm text-primary-800 dark:text-primary-200">
                <p className="font-medium mb-1">Live Class Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Students will receive notifications about the scheduled class</li>
                  <li>• You can start the class up to 15 minutes before scheduled time</li>
                  <li>• Recording will be available after the class ends (if enabled)</li>
                  <li>• Meeting link will be automatically generated</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 theme-text-secondary theme-bg-secondary hover:theme-bg-tertiary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              <span>{liveClass ? 'Update Class' : 'Schedule Class'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveClassScheduler;