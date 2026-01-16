import { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import Button from '../common/Button';

const DiscussionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ title: '', content: '' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-card p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold theme-text-primary">Ask a Question</h3>
          </div>
          <button onClick={onClose} className="theme-text-muted hover:theme-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-2">
              Question Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What's your question about?"
              className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              rows={6}
              className="w-full px-3 py-2 theme-bg-secondary theme-text-primary border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.title.trim() || !formData.content.trim()} className="flex-1">
              {submitting ? 'Posting...' : 'Post Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionModal;