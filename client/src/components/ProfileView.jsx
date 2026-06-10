import React, { useRef } from 'react';
import { Avatar } from './Avatar';
import { Carousel } from './Carousel';

export function ProfileView({ 
  currentUser, 
  userMap,
  resources,
  setActiveView,
  onAvatarSelect,
  onDeleteResource,
  onOpenPost
}) {
  const fileInputRef = useRef(null);

  if (!currentUser) return null;

  const ownResources = resources
    .filter(r => r.teacher?.toLowerCase() === currentUser.username.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const subjectNames = new Set(ownResources.map(r => r.subject));
  const pdfCount = ownResources.filter(r => r.fileType.includes("pdf")).length;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAvatarSelect(file);
    }
    e.target.value = ''; // reset
  };

  return (
    <section className="profile-screen" aria-labelledby="profileName">
      <header className="profile-header">
        <label className="profile-avatar-container" title="Change profile picture">
          <span className="profile-avatar">
            <Avatar username={currentUser.username} userMap={userMap} />
          </span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
        <div className="profile-info">
          <div className="profile-title-row">
            <h2 id="profileName">{currentUser.username}</h2>
            <button 
              className="secondary-button compact-button" 
              type="button"
              onClick={() => setActiveView('upload')}
            >
              New post
            </button>
          </div>
          <div className="profile-stats">
            <span><strong>{ownResources.length}</strong> posts</span>
            <span><strong>{subjectNames.size}</strong> subjects</span>
            <span><strong>{pdfCount}</strong> PDFs</span>
          </div>
          <p className="profile-bio">Vocational teacher sharing practical classroom resources.</p>
        </div>
      </header>

      <div className="profile-tabs" aria-label="Profile content">
        <span>Posts</span>
      </div>

      <div className="profile-grid">
        {ownResources.map(resource => {
          const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resource.createdAt));
          const files = resource.files || [{ fileName: resource.fileName, fileType: resource.fileType, dataUrl: resource.dataUrl }];

          return (
            <article 
              key={resource.id} 
              className="profile-tile" 
              tabIndex="0"
              onClick={(e) => {
                if (e.target.closest("button")) return;
                onOpenPost(resource);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenPost(resource);
                }
              }}
            >
              <div className="preview">
                <Carousel files={files} />
              </div>
              <div className="profile-overlay">
                <div>
                  <strong>{resource.title}</strong>
                  <span>{resource.subject} &middot; {created}</span>
                </div>
                <div className="profile-overlay-actions">
                  <button 
                    className="delete-button" 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteResource(resource.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {ownResources.length === 0 && (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Your uploaded resources will appear here on your profile.</p>
        </div>
      )}
    </section>
  );
}
