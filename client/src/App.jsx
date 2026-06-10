import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAppState } from './hooks/useAppState';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { ProfileView } from './components/ProfileView';
import { MessagesView } from './components/MessagesView';
import { PostModal } from './components/PostModal';
import { CropModal } from './components/CropModal';
import { updateAvatar } from './api';

export default function App() {
  const { currentUser, checked, checkSession, login, signup, logout } = useAuth();
  const { 
    subjects, resources, messages, userMap,
    loadState, loadUsers, addSubject, uploadResource, removeResource,
    fetchMessages, pushMessage, updateUserAvatar 
  } = useAppState();

  const [activeView, setActiveView] = useState('dashboard'); // dashboard, upload, profile, messages
  const [activeSubject, setActiveSubject] = useState('All Subjects');
  const [openPost, setOpenPost] = useState(null);
  const [cropFile, setCropFile] = useState(null);

  useEffect(() => {
    checkSession();
    loadState();
    loadUsers();
  }, [checkSession, loadState, loadUsers]);

  useEffect(() => {
    if (checked) {
      if (!currentUser) {
        document.body.classList.add('auth-active');
      } else {
        document.body.classList.remove('auth-active');
      }
    }
  }, [currentUser, checked]);

  if (!checked) return null; // loading

  if (!currentUser) {
    return <AuthScreen login={login} signup={signup} />;
  }

  const handleMessageUser = (username) => {
    setActiveView('messages');
  };

  const handleSaveAvatar = async (dataUrl) => {
    try {
      await updateAvatar(dataUrl);
      updateUserAvatar(currentUser.username, dataUrl);
    } catch (err) {
      console.error(err);
    }
    setCropFile(null);
  };

  return (
    <>
      <Sidebar 
        currentUser={currentUser}
        userMap={userMap}
        logout={logout}
        subjects={subjects}
        resources={resources}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        setActiveView={setActiveView}
        addSubject={addSubject}
      />
      <main className="workspace">
        <Topbar 
          activeView={activeView}
          setActiveView={setActiveView}
          activeSubject={activeSubject}
          currentUser={currentUser}
        />

        <div className={activeView === 'dashboard' ? '' : 'hidden'}>
          <DashboardView 
            resources={resources}
            activeSubject={activeSubject}
            currentUser={currentUser}
            userMap={userMap}
            onDeleteResource={removeResource}
            onMessageUser={handleMessageUser}
            onOpenPost={setOpenPost}
          />
        </div>

        <div className={activeView === 'upload' ? '' : 'hidden'}>
          <UploadView 
            subjects={subjects}
            activeSubject={activeSubject}
            uploadResource={uploadResource}
            setActiveView={setActiveView}
            setActiveSubject={setActiveSubject}
          />
        </div>

        <div className={activeView === 'profile' ? '' : 'hidden'}>
          <ProfileView 
            currentUser={currentUser}
            userMap={userMap}
            resources={resources}
            setActiveView={setActiveView}
            onAvatarSelect={setCropFile}
            onDeleteResource={removeResource}
            onOpenPost={setOpenPost}
          />
        </div>

        <div className={activeView === 'messages' ? '' : 'hidden'}>
          <MessagesView 
            currentUser={currentUser}
            messages={messages}
            fetchMessages={fetchMessages}
            pushMessage={pushMessage}
          />
        </div>
      </main>

      <PostModal 
        resource={openPost}
        currentUser={currentUser}
        userMap={userMap}
        onClose={() => setOpenPost(null)}
        onDelete={removeResource}
        onMessage={handleMessageUser}
      />

      <CropModal 
        file={cropFile}
        onSave={handleSaveAvatar}
        onCancel={() => setCropFile(null)}
      />
    </>
  );
}
