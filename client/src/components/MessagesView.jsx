import React, { useState, useEffect, useRef } from 'react';

export function MessagesView({ currentUser, messages, fetchMessages, pushMessage }) {
  const [activeConversation, setActiveConversation] = useState(null);
  const [content, setContent] = useState('');
  const feedRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchMessages();
    }
  }, [currentUser, fetchMessages]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, activeConversation]);

  if (!currentUser) {
    return (
      <section className="messages-screen">
        <div className="empty-state">
          <h3>Not signed in</h3>
          <p>Sign in to view your messages.</p>
        </div>
      </section>
    );
  }

  const conversations = new Set();
  messages.forEach(m => {
    if (m.sender !== currentUser.username) conversations.add(m.sender);
    if (m.recipient !== currentUser.username) conversations.add(m.recipient);
  });
  
  const convoList = Array.from(conversations);
  
  useEffect(() => {
    if (!activeConversation && convoList.length > 0) {
      setActiveConversation(convoList[0]);
    }
  }, [convoList, activeConversation]);

  const chatMessages = activeConversation 
    ? messages.filter(m => 
        (m.sender === currentUser.username && m.recipient === activeConversation) ||
        (m.sender === activeConversation && m.recipient === currentUser.username)
      ).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeConversation || !content.trim()) return;
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: activeConversation, content: content.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        pushMessage(data.message);
        setContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="messages-screen" aria-labelledby="messagesTitle">
      <div className="messages-layout">
        <aside className="messages-sidebar">
          <h3 id="messagesTitle">Conversations</h3>
          <div className="conversations-list">
            {convoList.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--text-dim)' }}>No conversations yet.</div>
            ) : (
              convoList.map(user => (
                <button 
                  key={user}
                  className={`subject-button ${user === activeConversation ? 'active' : ''}`} 
                  type="button" 
                  onClick={() => setActiveConversation(user)}
                >
                  <span>{user}</span>
                </button>
              ))
            )}
          </div>
        </aside>
        
        <div className="messages-content">
          <div className="active-conversation-header">
            {activeConversation ? `Chat with ${activeConversation}` : 'Select a conversation'}
          </div>
          
          <div className="messages-feed" ref={feedRef}>
            {activeConversation && chatMessages.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem', border: 'none' }}>
                Say hi to {activeConversation}!
              </div>
            )}
            {chatMessages.map(m => {
              const isMine = m.sender === currentUser.username;
              return (
                <div key={m.id} className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="chat-sender">{m.sender}</div>
                  <div className="chat-content">{m.content}</div>
                </div>
              );
            })}
          </div>

          {activeConversation && (
            <form className="message-form" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                required 
                autoComplete="off" 
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              <button type="submit" className="primary-button compact-button">Send</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
