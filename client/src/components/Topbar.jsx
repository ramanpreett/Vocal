import React from 'react';

export function Topbar({ activeView, setActiveView, activeSubject, currentUser }) {
  const isProfileView = activeView === 'profile' && currentUser;
  const title = isProfileView 
    ? currentUser.username 
    : (activeSubject === 'All Subjects' ? 'Recent teacher posts' : activeSubject);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Teacher workspace</p>
        <h1>{title}</h1>
      </div>
      <div className="view-switch" aria-label="Workspace views">
        <button 
          className={`view-button ${activeView === 'dashboard' ? 'active' : ''}`} 
          type="button"
          onClick={() => setActiveView('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`view-button ${activeView === 'messages' ? 'active' : ''}`} 
          type="button"
          onClick={() => setActiveView('messages')}
        >
          Messages
        </button>
        <button 
          className={`view-button ${activeView === 'upload' ? 'active' : ''}`} 
          type="button"
          onClick={() => setActiveView('upload')}
        >
          Upload
        </button>
        <button 
          className={`view-button ${activeView === 'profile' ? 'active' : ''}`} 
          type="button"
          onClick={() => setActiveView('profile')}
        >
          Profile
        </button>
      </div>
    </header>
  );
}
