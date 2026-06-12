import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiImage, FiVideo, FiFileText, FiGrid, FiSettings, FiMessageSquare, FiX, FiCamera, FiLoader } from 'react-icons/fi';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('All');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/api/users/profile/${username || 'me'}`);
        setProfileData(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div className="text-center pt-20">Loading profile...</div>;
  if (!profileData) return <div className="text-center pt-20">Profile not found</div>;

  const { user, posts } = profileData;
  const isOwnProfile = currentUser?._id === user._id;

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('photo', file);

      const res = await api.put('/api/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local state and global context
      setProfileData({ ...profileData, user: res.data });
      setUser(res.data);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload profile photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const tabs = ['All', 'Images', 'Videos', 'PDFs'];

  const filteredPosts = activeTab === 'All' 
    ? posts 
    : posts.filter(post => post.mediaType + 's' === activeTab.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        
        {/* Profile Picture */}
        <div 
          className={`relative w-32 h-32 rounded-full border-4 border-[#8B5CF6] shrink-0 overflow-hidden ${isOwnProfile ? 'cursor-pointer group' : ''}`}
          onClick={() => isOwnProfile && fileInputRef.current?.click()}
        >
          <img src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.fullName}`} alt={user.fullName} className="w-full h-full object-cover" />
          
          {isOwnProfile && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleProfilePhotoUpload} 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {isUploadingPhoto ? <FiLoader className="text-white text-3xl animate-spin" /> : <FiCamera className="text-white text-3xl" />}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{user.fullName}</h1>
              <p className="text-lg text-gray-500">@{user.username}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0 justify-center">
              <button className="flex items-center gap-2 px-6 py-2 bg-[#8B5CF6] text-gray-900 font-semibold rounded-full hover:bg-[#7C3AED] transition">
                <FiMessageSquare /> Message
              </button>
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition">
                <FiSettings className="text-xl" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start gap-8 mb-6 font-medium">
            <div className="text-center md:text-left"><span className="font-bold text-xl">{posts.length}</span> posts</div>
            <div className="text-center md:text-left"><span className="font-bold text-xl">{user.followers?.length || 0}</span> followers</div>
            <div className="text-center md:text-left"><span className="font-bold text-xl">{user.following?.length || 0}</span> following</div>
          </div>
          
          <p className="text-gray-700 mb-2">{user.bio || 'Vocational Educator'}</p>
          <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-4 justify-center md:justify-start">
            <span>📍 {user.location || 'Unknown Location'}</span>
            <span>🏫 {user.institution || 'VocTech Institute'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-t border-gray-200 mb-6">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-8 py-4 uppercase text-sm font-semibold tracking-widest transition border-t-2 ${
              activeTab === tab 
                ? 'border-[#8B5CF6] text-[#8B5CF6]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab === 'All' && <FiGrid />}
            {tab === 'Images' && <FiImage />}
            {tab === 'Videos' && <FiVideo />}
            {tab === 'PDFs' && <FiFileText />}
            <span className="hidden sm:inline">{tab}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1 md:gap-4 pb-20">
        {filteredPosts.map(post => (
          <div key={post._id} onClick={() => setSelectedPost(post)} className="aspect-square bg-white border border-gray-100 relative group cursor-pointer overflow-hidden rounded-md md:rounded-xl">
            {(post.mediaType === 'image' || post.thumbnailUrl) && (
              <img src={post.thumbnailUrl || post.mediaUrl} alt="Gallery item" className="w-full h-full object-contain group-hover:scale-110 transition duration-500" />
            )}
            {!post.thumbnailUrl && post.mediaType === 'pdf' && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition">
                <FiFileText className="text-4xl text-red-500 mb-2" />
                <span className="text-xs font-semibold px-2 text-center">{post.caption}</span>
              </div>
            )}
            {!post.thumbnailUrl && post.mediaType === 'video' && (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <FiVideo className="text-4xl text-white opacity-80 group-hover:scale-110 transition duration-500" />
              </div>
            )}
            {/* Overlay icon for thumbnails representing a video or pdf */}
            {post.thumbnailUrl && (
              <div className="absolute top-2 right-2 bg-black/60 rounded p-1 text-white">
                {post.mediaType === 'video' ? <FiVideo className="text-sm" /> : <FiFileText className="text-sm" />}
              </div>
            )}
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">No {activeTab.toLowerCase()} resources found.</div>
        )}
      </div>

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

export default Profile;
