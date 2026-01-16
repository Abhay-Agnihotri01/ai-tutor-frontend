import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Plus, Clock, Search, ArrowLeft, Paperclip } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const InstructorCommunicationPanel = () => {
  const { user } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [replies, setReplies] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    category: 'general'
  });

  const [replyMessage, setReplyMessage] = useState('');

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'course_approval', label: 'Course Approval' },
    { value: 'payout', label: 'Payout Request' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'content', label: 'Content Guidelines' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchCommunications();

    // Auto-refresh every 3 seconds for real-time updates
    const interval = setInterval(() => {
      if (!showNewMessage && document.visibilityState === 'visible') {
        fetchCommunications();
        // Also refresh replies if viewing a conversation
        if (selectedCommunication) {
          fetch(`${API_URL}/admin-communications/${selectedCommunication.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
              if (data.communication?.id === selectedCommunication.id) {
                setReplies(data.communication.replies || []);
              }
            })
            .catch(() => { });
        }
      }
    }, 3000);

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCommunications();
        if (selectedCommunication) {
          handleViewCommunication(selectedCommunication);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [filters, pagination.page, showNewMessage]);

  const fetchCommunications = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...filters
      });

      const response = await fetch(`${API_URL}/admin-communications?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();

      setCommunications(data.communications || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      }));
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Optimistic update
    const tempMessage = {
      id: Date.now().toString(),
      ...newMessage,
      senderId: user.id,
      receiverId: null,
      isFromAdmin: false,
      createdAt: new Date().toISOString(),
      status: 'unread'
    };

    setCommunications(prev => [tempMessage, ...prev]);
    setNewMessage({ subject: '', message: '', priority: 'normal', category: 'general' });
    setShowNewMessage(false);

    try {
      const response = await fetch(`${API_URL}/admin-communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...tempMessage,
          receiverId: null
        })
      });

      if (response.ok) {
        const realMessage = await response.json();
        setCommunications(prev =>
          prev.map(comm => comm.id === tempMessage.id ? realMessage : comm)
        );
      } else {
        setCommunications(prev => prev.filter(comm => comm.id !== tempMessage.id));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setCommunications(prev => prev.filter(comm => comm.id !== tempMessage.id));
    }
  };

  const handleViewCommunication = async (communication) => {
    setSelectedCommunication(communication);

    try {
      const response = await fetch(`${API_URL}/admin-communications/${communication.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setReplies(data.communication?.replies || []);

      // Mark as read if unread
      if (communication.status === 'unread') {
        await fetch(`${API_URL}/admin-communications/${communication.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: 'read' })
        });
        fetchCommunications();
      }
    } catch (error) {
      console.error('Error fetching communication details:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    // Optimistic update
    const tempReply = {
      id: Date.now().toString(),
      message: replyMessage,
      senderId: user.id,
      isFromAdmin: false,
      createdAt: new Date().toISOString()
    };

    setReplies(prev => [...prev, tempReply]);
    setReplyMessage('');

    // Update communication status optimistically
    setCommunications(prev =>
      prev.map(comm =>
        comm.id === selectedCommunication.id
          ? { ...comm, status: 'replied' }
          : comm
      )
    );

    try {
      const response = await fetch(`${API_URL}/admin-communications/${selectedCommunication.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: tempReply.message })
      });

      if (response.ok) {
        const realReply = await response.json();
        setReplies(prev =>
          prev.map(reply => reply.id === tempReply.id ? realReply : reply)
        );
      } else {
        setReplies(prev => prev.filter(reply => reply.id !== tempReply.id));
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplies(prev => prev.filter(reply => reply.id !== tempReply.id));
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 h-16 flex items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Communications</h1>
          </div>
          <button
            onClick={() => setShowNewMessage(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Contact Admin
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
          {/* Search & Filters */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {(communications || []).map((comm) => {
              const isSelected = selectedCommunication?.id === comm.id;
              return (
                <div
                  key={comm.id}
                  onClick={() => handleViewCommunication(comm)}
                  className={`p-4 border-b dark:border-gray-700 cursor-pointer transition-colors ${isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-r-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${comm.status === 'unread' ? 'bg-blue-25 dark:bg-blue-900/10' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${comm.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {comm.isFromAdmin ? 'Admin' : 'You'}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${comm.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            comm.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              comm.priority === 'normal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {comm.priority}
                          </span>
                          {comm.status === 'unread' && <Clock className="w-3 h-3 text-yellow-600" />}
                        </div>
                      </div>
                      <p className={`text-sm mb-1 truncate ${comm.status === 'unread' ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {comm.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                        {comm.message.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedCommunication ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCommunication(null)}
                      className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedCommunication.subject}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Conversation with Admin
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Original Message */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                      {selectedCommunication.isFromAdmin ? 'A' : 'Y'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedCommunication.isFromAdmin ? 'Admin' : 'You'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedCommunication.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedCommunication.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {(replies || []).map((reply) => (
                  <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                        {reply.isFromAdmin ? 'A' : 'Y'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {reply.isFromAdmin ? 'Admin' : 'You'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6">
                <form onSubmit={handleReply} className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (replyMessage.trim()) {
                          handleReply(e);
                        }
                      }
                    }}
                    placeholder="Type your reply... (Press Enter to send, Shift+Enter for new line)"
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!replyMessage.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversation selected</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Admin</h2>
              <button
                onClick={() => setShowNewMessage(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subject..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={newMessage.category}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message</label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="6"
                  placeholder="Type your message... (Press Ctrl+Enter to send)"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewMessage(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCommunicationPanel;