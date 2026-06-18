import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (token && savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ totalUnread: 0, senders: {} });
  const socketRef = useRef();

  const fetchUnreadCounts = async () => {
    if (user && localStorage.getItem('token')) {
      try {
        const res = await api.get('/api/messages/unread/count');
        setUnreadCounts(res.data);
      } catch (err) {
        console.error('Error fetching unread counts:', err);
      }
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchUnreadCounts();
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('join_room', user._id);

      socketRef.current.on('receive_message', (data) => {
        // We handle real-time unread updates here globally
        // Check if we are currently looking at this user's chat in Messages component
        // Since we can't easily check the active chat here, we will increment the unread count globally.
        // The Messages component will need to reset the count when the chat is opened.
        setUnreadCounts(prev => {
          const newSenders = { ...prev.senders };
          newSenders[data.sender] = (newSenders[data.sender] || 0) + 1;
          return {
            totalUnread: prev.totalUnread + 1,
            senders: newSenders
          };
        });
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user?._id]);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, unreadCounts, setUnreadCounts, socket: socketRef.current, fetchUnreadCounts }}>
      {children}
    </AuthContext.Provider>
  );
};
