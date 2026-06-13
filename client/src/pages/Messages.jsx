import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiSend, FiMoreVertical, FiPhone, FiVideo, FiFileText, FiX } from 'react-icons/fi';
import io from 'socket.io-client';
import api from '../api/axios';
import PostCard from '../components/PostCard';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [educators, setEducators] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch educators list
    const fetchEducators = async () => {
      try {
        const res = await api.get('/api/users');
        setEducators(res.data);
      } catch (error) {
        console.error('Error fetching educators:', error);
      }
    };
    fetchEducators();
  }, []);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('http://localhost:5000');
    
    if (user?._id) {
      socketRef.current.emit('join_room', user._id);
    }

    socketRef.current.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on('receive_message', (data) => {
      if (activeChatUser && data.sender === activeChatUser._id) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => socketRef.current.disconnect();
  }, [user, activeChatUser]);

  useEffect(() => {
    if (activeChatUser) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/api/messages/${activeChatUser._id}`);
          setMessages(res.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChatUser) return;

    try {
      const res = await api.post(`/api/messages/${activeChatUser._id}`, { message });
      const newMsg = res.data;

      // Send via socket
      socketRef.current.emit('send_message', {
        sender: user._id,
        receiverId: activeChatUser._id,
        message: newMsg.message,
        createdAt: newMsg.createdAt,
        _id: newMsg._id
      });

      setMessages([...messages, newMsg]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Messages</h2>
          <input 
            type="text" 
            placeholder="Search educators..." 
            className="w-full mt-4 px-4 py-2 bg-gray-100 rounded-lg outline-none"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {educators.length === 0 && <div className="p-4 text-gray-500 text-center">No other educators found.</div>}
          {educators.map(edu => (
            <div 
              key={edu._id} 
              onClick={() => setActiveChatUser(edu)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition ${activeChatUser?._id === edu._id ? 'border-l-4 border-[#8B5CF6] bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              <div className="relative">
                <img src={edu.profilePhoto || `https://ui-avatars.com/api/?name=${edu.fullName}`} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onlineUsers.includes(edu._id) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{edu.fullName}</h4>
                <p className="text-sm text-gray-500 truncate">@{edu.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {!activeChatUser ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select an educator to start messaging
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white/50">
              <Link to={`/profile/${activeChatUser.username}`} className="flex items-center gap-3 cursor-pointer group">
                <img src={activeChatUser.profilePhoto || `https://ui-avatars.com/api/?name=${activeChatUser.fullName}`} alt="avatar" className="w-10 h-10 rounded-full object-cover group-hover:ring-2 ring-[#8B5CF6] transition-all" />
                <div>
                  <h3 className="font-bold group-hover:text-[#8B5CF6] transition-colors">{activeChatUser.fullName}</h3>
                  {onlineUsers.includes(activeChatUser._id) ? (
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span> Offline
                    </p>
                  )}
                </div>
              </Link>
              <div className="flex gap-4 text-gray-500">
                <button className="hover:text-[#8B5CF6] transition"><FiPhone className="text-xl" /></button>
                <button className="hover:text-[#8B5CF6] transition"><FiVideo className="text-xl" /></button>
                <button className="hover:text-[#8B5CF6] transition"><FiMoreVertical className="text-xl" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => {
                const isMe = msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] break-words rounded-2xl px-6 py-3 shadow-sm ${
                      isMe 
                        ? 'bg-[#8B5CF6] text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.sharedPost && (
                        <div className={`mb-3 w-48 rounded-xl overflow-hidden border cursor-pointer hover:opacity-90 transition ${isMe ? 'border-white/20 bg-white/10' : 'border-gray-200 bg-white'}`} onClick={() => setSelectedPost(msg.sharedPost)}>
                          <div className="p-3 border-b border-inherit flex items-center gap-2">
                            <img src={msg.sharedPost.uploadedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sharedPost.uploadedBy?.fullName || 'U'}`} className="w-6 h-6 rounded-full object-cover" alt="author" />
                            <span className="font-bold text-sm truncate">{msg.sharedPost.uploadedBy?.username}</span>
                          </div>
                          <div className="block relative aspect-square bg-black/5 flex items-center justify-center">
                            <img src={msg.sharedPost.thumbnailUrl || msg.sharedPost.mediaUrl} className="w-full h-full object-cover" alt="shared post" />
                            {msg.sharedPost.mediaType === 'video' && <FiVideo className="absolute text-white text-3xl drop-shadow-md" />}
                            {msg.sharedPost.mediaType === 'pdf' && <FiFileText className="absolute text-white text-3xl drop-shadow-md" />}
                          </div>
                          {msg.sharedPost.caption && (
                            <div className="p-2 text-xs truncate">
                              {msg.sharedPost.caption}
                            </div>
                          )}
                        </div>
                      )}
                      {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/80' : 'text-gray-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white/50">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6] transition"
                />
                <button type="submit" disabled={!message.trim()} className={`p-4 rounded-xl flex items-center justify-center transition ${
                  message.trim() ? 'bg-[#8B5CF6] text-gray-900 hover:bg-[#7C3AED]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                  <FiSend className="text-xl" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      
      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
          <div className="relative w-full max-w-lg mt-8 overflow-visible" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 md:-right-12 z-50 text-white hover:text-gray-300 transition p-2" onClick={() => setSelectedPost(null)}>
              <FiX className="text-3xl md:text-4xl" />
            </button>
            <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
              <PostCard post={selectedPost} isProfile={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
