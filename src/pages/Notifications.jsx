import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, BookOpen, MessageSquare, AlertTriangle, Check, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const Notifications = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
    const [filter, setFilter] = useState('all'); // 'all', 'unread'

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const getIcon = (type) => {
        switch (type) {
            case 'course_update':
            case 'new_video':
            case 'new_assignment':
                return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'custom_message':
                return <MessageSquare className="w-5 h-5 text-purple-500" />;
            case 'alert':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.notifications.id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold theme-text-primary">Notifications</h1>
                {unreadCount > 0 && (
                    <Button onClick={handleMarkAllRead} variant="outline" size="sm" className="flex items-center space-x-2">
                        <Check className="w-4 h-4" />
                        <span>Mark all as read</span>
                    </Button>
                )}
            </div>

            <div className="theme-card rounded-xl border theme-border overflow-hidden">
                {/* Filters */}
                <div className="flex items-center gap-4 p-4 border-b theme-border bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 theme-text-secondary" />
                        <span className="text-sm font-medium theme-text-secondary">Filter:</span>
                    </div>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                            : 'theme-text-secondary hover:theme-bg-secondary'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                            : 'theme-text-secondary hover:theme-bg-secondary'
                            }`}
                    >
                        Unread
                    </button>
                </div>

                {/* List */}
                <div className="divide-y theme-border">
                    {isLoading ? (
                        <div className="p-8 text-center theme-text-secondary">Loading notifications...</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium theme-text-primary">No notifications</h3>
                            <p className="theme-text-secondary mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        filteredNotifications.map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                    }`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!item.isRead ? 'bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' : 'bg-transparent'
                                        }`}>
                                        {getIcon(item.notifications.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-base ${!item.isRead ? 'font-semibold' : 'font-medium'} theme-text-primary`}>
                                                {item.notifications.subject}
                                            </h4>
                                            <span className="text-xs theme-text-muted whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(item.notifications.sentAt), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {/* Render minimal content preview or simple text if html */}
                                        <p className="text-sm theme-text-secondary mt-1 line-clamp-2">
                                            {/* Strip HTML tags for preview if needed, or better yet rely on specific metadata for preview */}
                                            <span dangerouslySetInnerHTML={{ __html: item.notifications.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + (item.notifications.content.length > 150 ? '...' : '') }} />
                                        </p>

                                        {item.notifications.courseId && (
                                            <Link
                                                to={`/learn/${item.notifications.courseId}`}
                                                className="inline-block mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNotificationClick(item);
                                                }}
                                            >
                                                View Course
                                            </Link>
                                        )}
                                    </div>

                                    {!item.isRead && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
