import React, { useEffect, useRef } from 'react';
import { Avatar } from './Avatar';
import { Carousel } from './Carousel';

function labelForType(type) {
  if (type.startsWith("image/")) return "Diagram";
  if (type.startsWith("video/")) return "Video";
  if (type.includes("pdf")) return "PDF";
  return "File";
}

export function PostModal({ resource, currentUser, userMap, onClose, onDelete, onMessage }) {
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (resource) {
      document.body.classList.add('modal-open');
      closeBtnRef.current?.focus();
    } else {
      document.body.classList.remove('modal-open');
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape' && resource) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('modal-open');
    };
  }, [resource, onClose]);

  if (!resource) return null;

  const created = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resource.createdAt));
  const isOwn = currentUser && resource.teacher?.toLowerCase() === currentUser.username.toLowerCase();
  const files = resource.files || [{ fileName: resource.fileName, fileType: resource.fileType, dataUrl: resource.dataUrl }];

  return (
    <div className="post-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="post-modal-backdrop" onClick={onClose}></div>
      <article className="post-modal-card">
        <button 
          ref={closeBtnRef}
          className="modal-close-button" 
          type="button" 
          aria-label="Close post"
          onClick={onClose}
        >
          x
        </button>
        
        <div className="modal-preview">
          <div className="preview">
            <Carousel files={files} />
          </div>
        </div>
        
        <div className="modal-details">
          <div className="post-header modal-post-header">
            <span className="avatar">
              <Avatar username={resource.teacher} userMap={userMap} />
            </span>
            <div>
              <strong>{resource.teacher || "Teacher"}</strong>
              <span>{resource.subject} - {created} - {labelForType(resource.fileType)}</span>
            </div>
            {!isOwn && currentUser && (
              <button 
                className="secondary-button compact-button" 
                type="button" 
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  onClose();
                  onMessage(resource.teacher);
                }}
              >
                Message
              </button>
            )}
          </div>
          <h2 id="modalTitle">{resource.title}</h2>
          <p>{resource.description || "No description added."}</p>
          <div className="post-actions">
            {isOwn && (
              <button 
                className="delete-button" 
                type="button" 
                onClick={() => {
                  onDelete(resource.id);
                  onClose();
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
