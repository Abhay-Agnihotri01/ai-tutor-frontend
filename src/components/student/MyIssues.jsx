import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { API_URL } from '../../config/api';

const MyIssues = ({ isOpen, onClose }) => {
  const [communications, setCommunications] = useState([]);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCommunications();
      const interval = setInterval(() => {
        fetchCommunications();
        // Auto-refresh selected conversation if it exists
        if (selectedCommunication) {
          fetchCommunicationDetails(selectedCommunication.id);
        }
      }, 2000); // Reduced to 2 seconds for faster updates
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedCommunication?.id]);

  const fetchCommunications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching communications with token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_URL}/admin-communications/communications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Communications data:', data);
      setCommunications(data.communications || []);
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const fetchCommunicationDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin-communications/communications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedCommunication(data.communication);

      // Update the communication in the list with new reply count
      setCommunications(prev => prev.map(comm =>
        comm.id === id ? { ...comm, replyCount: data.communication.replies?.length || 0 } : comm
      ));
    } catch (error) {
      console.error('Error fetching communication details:', error);
    }
  };

  const sendReply = async () => {
    if (!newReply.trim() || !selectedCommunication) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/admin-communications/communications/${selectedCommunication.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newReply })
      });

      setNewReply('');
      fetchCommunicationDetails(selectedCommunication.id);
      fetchCommunications();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'read': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'replied': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[80vh] flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Issues</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {communications.map((comm) => (
              <div
                key={comm.id}
                onClick={() => fetchCommunicationDetails(comm.id)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedCommunication?.id === comm.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(comm.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(comm.priority)}`}>
                      {comm.priority}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(comm.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                  {comm.subject}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {comm.message}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">{comm.category}</span>
                  {comm.replyCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {comm.replyCount} replies
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedCommunication ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedCommunication.subject}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedCommunication.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedCommunication.priority)}`}>
                      {selectedCommunication.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  Category: {selectedCommunication.category}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original Message */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      You
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedCommunication.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedCommunication.message}
                  </p>
                </div>

                {/* Replies */}
                {selectedCommunication.replies?.map((reply) => (
                  <div key={reply.id} className={`rounded-lg p-4 ${reply.isFromAdmin ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${reply.isFromAdmin ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                        {reply.isFromAdmin ? 'A' : 'You'}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {reply.isFromAdmin ? 'Admin' : 'You'}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows="3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={!newReply.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select an issue to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyIssues;