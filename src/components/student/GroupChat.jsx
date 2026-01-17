import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Users, MessageSquare, Search, MoreVertical, Hash } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { API_URL, BASE_URL } from '../../config/api';
import axios from 'axios';

const GroupChat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Default rooms as fallback
  const defaultRooms = [
    { id: 'general', name: 'General', icon: Hash, description: 'General discussion for all students' },
    { id: 'study-group', name: 'Study Group', icon: Users, description: 'Study together and share resources' },
    { id: 'help', name: 'Help & Support', icon: MessageSquare, description: 'Get help from peers and instructors' }
  ];

  useEffect(() => {
    fetchChatRooms();

    // Initialize socket connection
    socketRef.current = io(BASE_URL);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (activeRoom && user) {
      // Update URL when activeRoom changes
      setSearchParams({ room: activeRoom });
      fetchMessages();

      // Mark room as read
      markRoomAsRead(activeRoom);

      // Join room via socket
      if (socketRef.current) {
        socketRef.current.emit('join-room', {
          roomId: activeRoom,
          userId: user.id,
          userType: user.role,
          userName: `${user.firstName} ${user.lastName}`
        });

        // Remove previous listeners to avoid duplicates
        socketRef.current.off('chat-message');
        socketRef.current.off('existing-participants');

        // Listen for new messages
        socketRef.current.on('chat-message', (message) => {
          // Ignore own messages to prevent duplication with optimistic updates
          // (Only if it's the active room, otherwise we might want to know? 
          //  Actually user sends to active room, so we already know it's read/handled)
          if (message.userId === user.id) return;

          if (message.roomId === activeRoom) {
            setMessages((prevMessages) => {
              // Avoid duplicates
              if (prevMessages.some(m => m.id === message.id)) {
                return prevMessages;
              }
              return [...prevMessages, message];
            });
            scrollToBottom();
          } else {
            // Message is for another room, increment unread count
            setChatRooms(prev => prev.map(room =>
              room.id === message.roomId
                ? { ...room, unreadCount: (room.unreadCount || 0) + 1 }
                : room
            ));
          }
        });

        // Listen for global online users updates
        socketRef.current.on('online-users-update', (users) => {
          const formattedUsers = users.map(u => ({
            id: u.userId,
            name: u.userName,
            status: 'online',
            avatar: null // Avatar currently missing from socket data
          }));

          // Ensure current user is in the list (though server should include them)
          // and deduplicate just in case
          const uniqueUsers = Array.from(new Map(formattedUsers.map(u => [u.id, u])).values());

          setOnlineUsers(uniqueUsers);
        });
      }
    }
  }, [activeRoom, user]);

  // Sync activeRoom with URL param when it changes externally (e.g. back button)
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam && roomParam !== activeRoom && chatRooms.some(r => r.id === roomParam)) {
      setActiveRoom(roomParam);
    }
  }, [searchParams, chatRooms]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markRoomAsRead = async (roomId) => {
    try {
      await axios.post(`${API_URL}/group-chat/rooms/${roomId}/read`);
      // Update local state to clear unread count
      setChatRooms(prev => prev.map(room =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ));
    } catch (error) {
      console.error('Error marking room as read:', error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/group-chat/rooms`);
      if (response.data.success && response.data.rooms.length > 0) {
        const roomsWithIcons = response.data.rooms.map(room => ({
          ...room,
          icon: room.name.toLowerCase().includes('general') ? Hash :
            room.name.toLowerCase().includes('study') ? Users : MessageSquare
        }));
        setChatRooms(roomsWithIcons);

        // precise logic: 
        // 1. try to get room from URL
        // 2. if not found in URL or URL room not in list, use first room
        // 3. do NOT default if we already have an active room (unless it's invalid)

        const roomParam = searchParams.get('room');
        const initialRoomId = roomParam && roomsWithIcons.some(r => r.id === roomParam)
          ? roomParam
          : roomsWithIcons[0].id;

        if (!activeRoom) {
          setActiveRoom(initialRoomId);
        }

      } else {
        // Use default rooms if API fails or returns empty
        setChatRooms(defaultRooms);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms(defaultRooms);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/group-chat/rooms/${activeRoom}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Keep existing messages or show empty state
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/group-chat/online-users`);
      if (response.data.success) {
        setOnlineUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
      // Use mock data as fallback
      setOnlineUsers([
        { id: 1, name: 'Alice Johnson', status: 'online' },
        { id: 2, name: 'Bob Smith', status: 'online' },
        { id: 3, name: 'Carol Davis', status: 'away' },
        { id: 4, name: 'David Wilson', status: 'online' }
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempMessage = {
      id: `temp-${Date.now()}`,
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        avatar: user?.avatar
      },
      message: messageText,
      createdAt: new Date().toISOString(),
      roomId: activeRoom
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await axios.post(`${API_URL}/group-chat/rooms/${activeRoom}/messages`, {
        message: messageText
      });

      if (response.data.success) {
        // Replace temp message with real one
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? response.data.message : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageText); // Restore message text
    }
  };

  const activeRoomInfo = chatRooms.find(room => room.id === activeRoom) || chatRooms[0];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Student Chat
          </h1>
        </div>

        {/* Chat Rooms */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">CHAT ROOMS</h3>
            <div className="space-y-1">
              {chatRooms.map((room) => {
                const RoomIcon = room.icon;
                const isActive = activeRoom === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    <RoomIcon className="w-5 h-5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">{room.name}</p>
                        {room.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {room.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online Users */}
          <div className="p-4 border-t dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              ONLINE USERS ({onlineUsers.filter(u => u.status === 'online').length})
            </h3>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name[0]}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <activeRoomInfo.icon className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeRoomInfo.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeRoomInfo.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Be the first to start the conversation in {activeRoomInfo?.name}!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const userName = message.users ?
                `${message.users.firstName} ${message.users.lastName}` :
                `${message.user?.firstName || ''} ${message.user?.lastName || ''}`.trim() || 'Unknown User';
              const userAvatar = message.users?.avatar || message.user?.avatar;

              return (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {userAvatar ? (
                      <img
                        src={userAvatar.startsWith('http') ? userAvatar : `${BASE_URL}${userAvatar}`}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      userName[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${activeRoomInfo.name}...`}
                className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;