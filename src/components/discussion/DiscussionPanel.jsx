import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, CheckCircle, Clock, User, MessageSquare, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Pagination from '../common/Pagination';

import DiscussionThread from './DiscussionThread';
import { API_URL } from '../../config/api';

const DiscussionPanel = ({ courseId, videoId = null, className = '' }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResolved, setFilterResolved] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalDiscussions: 0 });
  const { user } = useAuth();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, videoId, currentPage, searchTerm, filterResolved]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(videoId && { videoId }),
        ...(searchTerm && { search: searchTerm }),
        ...(filterResolved !== 'all' && { resolved: filterResolved === 'resolved' })
      });


      const response = await fetch(`${API_URL}/discussions/course/${courseId}?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions || []);
        setPagination(data.pagination || { totalPages: 1, totalDiscussions: 0 });
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/discussions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          courseId,
          videoId
        })
      });

      if (response.ok) {
        toast.success('Question posted successfully! The instructor will be notified.');
        setShowForm(false);
        setFormData({ title: '', content: '' });
        fetchDiscussions();
      } else {
        throw new Error('Failed to create discussion');
      }
    } catch (error) {
      toast.error('Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedDiscussion) {
    return (
      <DiscussionThread
        discussionId={selectedDiscussion}
        onBack={() => setSelectedDiscussion(null)}
        className={className}
      />
    );
  }

  return (
    <div className={`theme-card rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold theme-text-primary">Discussion</h3>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancel' : 'Ask Question'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateDiscussion} className="mb-6 p-4 theme-bg-secondary rounded-lg border theme-border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Question Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's your question about?"
                className="w-full px-3 py-2 theme-bg-primary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium theme-text-primary mb-2">
                Question Details *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your question in detail..."
                rows={4}
                className="w-full px-3 py-2 theme-bg-primary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormData({ title: '', content: '' }); }} size="sm">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !formData.title.trim() || !formData.content.trim()} size="sm">
                {submitting ? 'Posting...' : 'Post Question'}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-muted" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm theme-bg-secondary theme-text-primary border theme-border rounded-lg"
          />
        </div>

        <select
          value={filterResolved}
          onChange={(e) => setFilterResolved(e.target.value)}
          className="px-3 py-2 text-sm theme-bg-secondary theme-text-primary border theme-border rounded-lg"
        >
          <option value="all">All Questions</option>
          <option value="unresolved">Unresolved</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="theme-bg-secondary rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : discussions.length > 0 ? (
        <>
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                onClick={() => setSelectedDiscussion(discussion.id)}
                className="theme-bg-secondary rounded-lg p-4 cursor-pointer hover:theme-bg-tertiary transition-colors"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium theme-text-primary">{discussion.title}</h4>
                  {discussion.isresolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>

                <p className="text-sm theme-text-secondary line-clamp-2 mb-3">
                  {discussion.content}
                </p>

                <div className="flex items-center justify-between text-xs theme-text-muted">
                  <div className="flex items-center space-x-4">
                    <span>{discussion.users?.firstName} {discussion.users?.lastName}</span>
                    <span>{new Date(discussion.createdat).toLocaleDateString()}</span>
                  </div>
                  <span>{discussion.replyCount || 0} replies</span>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalDiscussions}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                size="sm"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 theme-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold theme-text-primary mb-2">No questions yet</h3>
          <p className="theme-text-secondary mb-6">Be the first to ask a question!</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ask First Question
          </Button>
        </div>
      )}


    </div>
  );
};

export default DiscussionPanel;