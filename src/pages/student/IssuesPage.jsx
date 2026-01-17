import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Plus, Filter, Search } from 'lucide-react';
import { API_URL } from '../../config/api';
import ReportIssue from '../../components/student/ReportIssue';

const IssuesPage = () => {
    const [communications, setCommunications] = useState([]);
    const [selectedCommunication, setSelectedCommunication] = useState(null);
    const [newReply, setNewReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, active, closed
    const messagesEndRef = React.useRef(null);
    const replyInputRef = React.useRef(null);
    const unreadDividerRef = React.useRef(null);

    const scrollToBottom = () => {
        if (unreadDividerRef.current) {
            unreadDividerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedCommunication?.replies, selectedCommunication]);

    useEffect(() => {
        if (selectedCommunication && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [selectedCommunication]);


    useEffect(() => {
        fetchCommunications();
        const interval = setInterval(() => {
            fetchCommunications();
            // Auto-refresh selected conversation if it exists
            if (selectedCommunication) {
                fetchCommunicationDetails(selectedCommunication.id);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedCommunication?.id]);

    const fetchCommunications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin-communications/communications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch issues');

            const data = await response.json();
            setCommunications(data.communications || []);
        } catch (error) {
            console.error('Error fetching communications:', error);
        }
    };

    const fetchCommunicationDetails = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin-communications/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSelectedCommunication(data.communication);

            // Update the communication in the list
            setCommunications(prev => prev.map(comm =>
                comm.id === id ? { ...comm, ...data.communication } : comm
            ));

            // Mark as read (update timestamp)
            if (data.communication.status === 'replied') {
                await fetch(`${API_URL}/admin-communications/${id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'read' })
                });
                // Refresh list to update badge counts
                fetchCommunications();
            }
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

    const filteredCommunications = communications.filter(comm => {
        if (filter === 'all') return true;
        if (filter === 'active') return comm.status !== 'resolved';
        if (filter === 'closed') return comm.status === 'resolved';
        return true;
    });

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 pt-16">
            {/* Sidebar List */}
            <div className="w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Issues</h1>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Report New Issue"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {['all', 'active', 'closed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${filter === f
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredCommunications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No issues found</p>
                        </div>
                    ) : (
                        filteredCommunications.map((comm) => (
                            <div
                                key={comm.id}
                                onClick={() => fetchCommunicationDetails(comm.id)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCommunication?.id === comm.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(comm.status)}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(comm.priority)}`}>
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
                                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                                        {comm.category}
                                    </span>
                                    {comm.status === 'replied' && (
                                        <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse flex items-center gap-1">
                                            NEW REPLY {comm.unreadCount > 0 ? `(${comm.unreadCount})` : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                {selectedCommunication ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedCommunication.subject}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        {getStatusIcon(selectedCommunication.status)}
                                        <span className="capitalize text-sm font-medium">{selectedCommunication.status}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${getPriorityColor(selectedCommunication.priority)}`}>
                                        {selectedCommunication.priority} Priority
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Filter className="w-4 h-4" />
                                    {selectedCommunication.category}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Created {new Date(selectedCommunication.createdAt).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    ID: {selectedCommunication.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Original Message */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                        You
                                    </div>
                                </div>
                                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                                        {selectedCommunication.message}
                                    </p>
                                </div>
                            </div>

                            {/* Replies */}
                            {(selectedCommunication.replies || []).map((reply, index) => {
                                const replies = selectedCommunication.replies || [];
                                const lastRead = selectedCommunication.userLastReadAt ? new Date(selectedCommunication.userLastReadAt) : new Date(0);
                                const replyDate = new Date(reply.createdAt);

                                // For User/Student, new messages are those FROM admin
                                const isNew = reply.isFromAdmin && replyDate > lastRead;
                                const prevReply = index > 0 ? replies[index - 1] : null;
                                const prevWasNew = prevReply && prevReply.isFromAdmin && new Date(prevReply.createdAt) > lastRead;
                                const showDivider = isNew && !prevWasNew;

                                return (
                                    <React.Fragment key={reply.id}>
                                        {showDivider && (
                                            <div ref={unreadDividerRef} className="flex justify-center my-4">
                                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium border border-blue-200 shadow-sm">
                                                    Unread Messages
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex gap-4 ${!reply.isFromAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${reply.isFromAdmin ? 'bg-orange-500' : 'bg-blue-500'
                                                    }`}>
                                                    {reply.isFromAdmin ? 'A' : 'You'}
                                                </div>
                                            </div>
                                            <div className={`flex-1 max-w-3xl p-5 shadow-sm rounded-2xl ${reply.isFromAdmin
                                                ? 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-tr-none'
                                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`font-semibold ${reply.isFromAdmin ? 'text-orange-900 dark:text-orange-200' : 'text-gray-900 dark:text-white'}`}>
                                                        {reply.isFromAdmin ? 'Support Team' : 'You'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                    {reply.message}
                                                </p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Input */}
                        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="max-w-4xl mx-auto flex gap-4">
                                <textarea
                                    ref={replyInputRef}
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    placeholder="Type your reply here..."
                                    className="flex-1 p-4 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-white shadow-inner transition-all"
                                    rows="3"
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!newReply.trim() || loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all h-fit self-end flex items-center gap-2 font-medium"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Send Reply</span>
                                            <MessageSquare className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select an Issue</h3>
                        <p className="max-w-md text-center">
                            Choose an issue from the list to view details or create a new one to get help.
                        </p>
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Report New Issue
                        </button>
                    </div>
                )}
            </div>

            <ReportIssue
                isOpen={isReportModalOpen}
                onClose={() => {
                    setIsReportModalOpen(false);
                    fetchCommunications(); // Refresh list after closing (presumably after submit)
                }}
            />
        </div>
    );
};

export default IssuesPage;
