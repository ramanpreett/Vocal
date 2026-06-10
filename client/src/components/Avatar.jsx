import React from 'react';

function getInitials(name) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export function Avatar({ username, userMap }) {
  const user = userMap?.[username?.toLowerCase()];
  
  if (user?.avatar) {
    return <img src={user.avatar} alt={username} className="avatar-img" />;
  }
  
  return <>{getInitials(username || 'Teacher')}</>;
}
