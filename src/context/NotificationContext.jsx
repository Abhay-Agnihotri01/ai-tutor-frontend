import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';
import { BASE_URL } from '../config/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize Socket.IO
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            const newSocket = io(BASE_URL);
            setSocket(newSocket);

            // Join user's room logic is handled by backend assuming generic connection
            // But we usually need to emit an event to identify the user if not using auth middleware on socket
            // In socketService.js, it listens to 'join-room'. 
            // We should probably join a room named with userId to receive personal notifications?
            // Wait, socketService.js: socket.on('join-room', ...)
            // AND it tracks 'onlineUsers' map.
            // But sendNotificationToUser uses socketId from onlineUsers map.
            // So ensuring we are "online" is enough.
            // We need to emit 'join-room' with userId to register in 'onlineUsers' properly?
            // Looking at `socketService.js`:
            // socket.on('join-room', ({ roomId, userId, ... }) => { ... updates onlineUsers ... })
            // So we MUST emit 'join-room' at least once with ANY roomId (maybe 'global' or user's ID) to register.

            newSocket.emit('join-room', {
                roomId: `user_${user.id}`,
                userId: user.id,
                userType: user.role,
                userName: `${user.firstName} ${user.lastName}`
            });

            newSocket.on('new-notification', (notification) => {
                // Optimistically update unread count
                setUnreadCount(prev => prev + 1);

                // Invalidate queries to fetch fresh data
                queryClient.invalidateQueries(['notifications']);

                // Play sound?
            });

            return () => newSocket.close();
        }
    }, [isAuthenticated, user, queryClient]);

    // Fetch notifications
    const { data: notificationData, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await axios.get('/api/notifications/my-notifications?limit=50');
            console.log(response.data);
            return response.data;
        },
        enabled: isAuthenticated,
        onSuccess: (data) => {
            setUnreadCount(data.unreadCount);
        }
    });

    // Keep unreadCount in sync whenever data changes
    useEffect(() => {
        if (notificationData?.unreadCount !== undefined) {
            setUnreadCount(notificationData.unreadCount);
        }
    }, [notificationData]);

    // Mark read mutation
    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            await axios.put(`/api/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    // Mark all read mutation
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await axios.put('/api/notifications/mark-all-read');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            setUnreadCount(0);
        }
    });

    return (
        <NotificationContext.Provider value={{
            notifications: notificationData?.notifications || [],
            unreadCount, // Use local state for instant updates, syncs with server
            isLoading,
            markAsRead: markReadMutation.mutate,
            markAllAsRead: markAllReadMutation.mutate
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
