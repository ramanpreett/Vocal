import React, { useState, useEffect } from 'react';
import { Avatar } from './Avatar';

export function Sidebar({ 
  currentUser, 
  userMap, 
  logout, 
  subjects, 
  resources, 
  activeSubject, 
  setActiveSubject, 
  setActiveView,
  addSubject 
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    const isCollapsed = localStorage.getItem('vocal-sidebar-collapsed') === 'true';
    setCollapsed(isCollapsed);
    if (isCollapsed) document.body.classList.add('sidebar-collapsed');
    else document.body.classList.remove('sidebar-collapsed');
  }, []);

  const toggleSidebar = () => {
    const val = !collapsed;
    setCollapsed(val);
    localStorage.setItem('vocal-sidebar-collapsed', val.toString());
    if (val) document.body.classList.add('sidebar-collapsed');
    else document.body.classList.remove('sidebar-collapsed');
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const name = newSubject.trim().replace(/\s+/g, " ");
    if (!name || subjects.some(s => s.toLowerCase() === name.toLowerCase())) return;
    
    const success = await addSubject(name);
    if (success) {
      setActiveSubject(name);
      setNewSubject('');
      setShowSubjectForm(false);
      setActiveView('dashboard');
    }
  };

  const subjectList = ['All Subjects', ...subjects];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">V</span>
        <div>
          <strong>Vocal</strong>
          <small>Vocational teaching hub</small>
        </div>
        <button 
          className="sidebar-toggle" 
          type="button" 
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebar}
        >
          <span></span>
        </button>
      </div>

      {currentUser && (
        <div className="account-panel">
          <span className="avatar">
            <Avatar username={currentUser.username} userMap={userMap} />
          </span>
          <div>
            <strong>{currentUser.username}</strong>
            <button type="button" onClick={logout}>Log out</button>
          </div>
        </div>
      )}

      <nav className="subject-panel" aria-label="Subjects">
        <div className="panel-heading">
          <span>Subjects</span>
          <button className="icon-button" type="button" title="Add subject" onClick={() => setShowSubjectForm(!showSubjectForm)}>+</button>
        </div>
        
        {showSubjectForm && (
          <form className="subject-form" onSubmit={handleAddSubject}>
            <label>Subject name</label>
            <div className="inline-form">
              <input 
                type="text" 
                placeholder="e.g. Electrical Wiring" 
                maxLength="40" 
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                autoFocus
              />
              <button type="submit">Add</button>
            </div>
          </form>
        )}

        <div className="subject-list">
          {subjectList.map(subject => {
            const count = subject === "All Subjects"
              ? resources.length
              : resources.filter((r) => r.subject === subject).length;

            return (
              <button 
                key={subject}
                className={`subject-button ${subject === activeSubject ? "active" : ""}`} 
                type="button"
                onClick={() => {
                  setActiveSubject(subject);
                  setActiveView('dashboard');
                }}
              >
                <span>{subject}</span>
                <strong>{count}</strong>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
