import React from 'react';
import { Avatar } from './Avatar';
import { Carousel } from './Carousel';

function labelForType(type) {
  if (type.startsWith("image/")) return "Diagram";
  if (type.startsWith("video/")) return "Video";
  if (type.includes("pdf")) return "PDF";
  return "File";
}

export function ResourceCard({ 
  resource, 
  currentUser, 
  userMap, 
  onDelete, 
  onMessage, 
  onOpen 
}) {
  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resource.createdAt));
  
  const isOwn = currentUser && resource.teacher?.toLowerCase() === currentUser.username.toLowerCase();
  
  const fileTypeLabel = labelForType(resource.fileType);
  
  const files = resource.files || [{ fileName: resource.fileName, fileType: resource.fileType, dataUrl: resource.dataUrl }];

  return (
    <article 
      className="resource-card" 
      tabIndex="0"
      onClick={(e) => {
        if (e.target.closest("a, button, video, .slide-download, .ig-btn")) return;
        onOpen(resource);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(resource);
        }
      }}
    >
      <header className="post-header">
        <span className="avatar">
          <Avatar username={resource.teacher} userMap={userMap} />
        </span>
        <div>
          <strong>{resource.teacher || "Teacher"}</strong>
          <span>{resource.subject} &middot; {created} &middot; {fileTypeLabel}</span>
        </div>
      </header>
      
      <div className="preview">
        <Carousel files={files} />
      </div>
      
      <div className="resource-body">
        <div className="resource-meta">
          <span>{resource.subject}</span>
          <span>{fileTypeLabel}</span>
        </div>
        <h3>{resource.title}</h3>
        <p>{resource.description || "No description added."}</p>
        <div className="post-actions">
          {isOwn && (
            <button className="delete-button" type="button" onClick={() => onDelete(resource.id)}>
              Delete
            </button>
          )}
          {!isOwn && currentUser && (
            <button 
              className="secondary-button compact-button" 
              type="button" 
              style={{ marginLeft: 'auto' }}
              onClick={() => onMessage(resource.teacher)}
            >
              Message
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
