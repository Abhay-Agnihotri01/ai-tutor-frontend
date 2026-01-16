import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, CheckCircle, User, Clock, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

import Button from '../common/Button';
import { API_URL } from '../../config/api';

const DiscussionThread = ({ discussionId, onBack, className = '' }) => {
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDiscussion();
  }, [discussionId]);

  const fetchDiscussion = async () => {
    try {
      const response = await fetch(`${API_URL}/discussions/${discussionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussion(data.discussion);
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
      toast.error('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (response.ok) {
        toast.success('Reply posted successfully!');
        setReplyContent('');
        fetchDiscussion();
      }
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      const response = await fetch(`${API_URL}/discussions/${discussionId}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        toast.success('Discussion marked as resolved!');
        fetchDiscussion();
      }
    } catch (error) {
      toast.error('Failed to mark as resolved');
    }
  };

  if (loading) {
    return (
      <div className={`theme-card rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className={`theme-card rounded-lg p-6 ${className}`}>
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 theme-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold theme-text-primary mb-2">Discussion not found</h3>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-card rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 theme-text-muted hover:theme-text-primary">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to discussions</span>
        </button>

        {!discussion.isresolved && (user.id === discussion.userid || user.role === 'instructor') && (
          <Button onClick={handleMarkResolved} size="sm" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Resolved
          </Button>
        )}
      </div>

      {/* Original Question */}
      <div className="theme-bg-secondary rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold theme-text-primary">{discussion.title}</h1>
            {discussion.isresolved && <CheckCircle className="w-5 h-5 text-green-500" />}
          </div>
        </div>

        <div className="prose prose-sm max-w-none theme-text-primary mb-4">
          {discussion.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2">{paragraph}</p>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm theme-text-muted">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{discussion.users.firstName} {discussion.users.lastName}</span>
              {discussion.users.role === 'instructor' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">
                  Instructor
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(discussion.createdat).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold theme-text-primary">
          Replies ({discussion.replies?.length || 0})
        </h3>

        {discussion.replies?.map((reply) => (
          <div key={reply.id} className={`rounded-lg p-4 ${reply.isinstructorreply
            ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
            : 'theme-bg-tertiary'
            }`}>
            <div className="prose prose-sm max-w-none theme-text-primary mb-3">
              {reply.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-sm theme-text-muted">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{reply.users.firstName} {reply.users.lastName}</span>
                {reply.users.role === 'instructor' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded text-xs">
                    Instructor
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(reply.createdat).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <form onSubmit={handleReply} className="space-y-4">
        <div>
          <label className="block text-sm font-medium theme-text-primary mb-2">
            Add your reply
          </label>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts or answer..."
            rows={4}
            className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || !replyContent.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DiscussionThread;