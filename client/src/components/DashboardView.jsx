import React, { useState } from 'react';
import { ResourceCard } from './ResourceCard';

export function DashboardView({ 
  resources, 
  activeSubject, 
  currentUser, 
  userMap,
  onDeleteResource,
  onMessageUser,
  onOpenPost
}) {
  const [query, setQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const subjectMatch = activeSubject === "All Subjects" || resource.subject === activeSubject;
    const q = query.trim().toLowerCase();
    const queryMatch = !q
      || resource.title.toLowerCase().includes(q)
      || (resource.teacher || "").toLowerCase().includes(q)
      || (resource.description || "").toLowerCase().includes(q)
      || (resource.fileName || "").toLowerCase().includes(q);

    return subjectMatch && queryMatch;
  });

  const heading = activeSubject === "All Subjects" ? "Recently uploaded" : `Recent ${activeSubject} posts`;

  return (
    <section className="content-area">
      <div className="section-toolbar">
        <div>
          <h2>{heading}</h2>
          <p id="feedSummary">
            {filteredResources.length} {filteredResources.length === 1 ? 'post' : 'posts'} in view. Newest uploads appear first.
          </p>
        </div>
        <label className="search-box">
          <span>Search</span>
          <input 
            type="search" 
            placeholder="Find by title or description" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="feed-list">
        {filteredResources.map(resource => (
          <ResourceCard 
            key={resource.id} 
            resource={resource}
            currentUser={currentUser}
            userMap={userMap}
            onDelete={onDeleteResource}
            onMessage={onMessageUser}
            onOpen={onOpenPost}
          />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="empty-state">
          <h3>No content yet</h3>
          <p>Open the upload screen, share a resource, and it will appear here as a recent teacher post.</p>
        </div>
      )}
    </section>
  );
}
