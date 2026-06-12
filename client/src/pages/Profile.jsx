import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FiImage, FiVideo, FiFileText, FiGrid, FiSettings, FiMessageSquare, FiX, FiCamera, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('All');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({ bio: '', location: '', institution: '', experience: '', skills: [] });
  const [availableSkills, setAvailableSkills] = useState([]);
  const fileInputRef = useRef(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          api.get(`/api/users/profile/${username || 'me'}`),
          api.get('/api/skills')
        ]);
        setProfileData(profileRes.data);
        setAvailableSkills(skillsRes.data);
        if (currentUser && profileRes.data.user) {
          setIsFollowing(profileRes.data.user.followers.includes(currentUser._id));
          setFollowersCount(profileRes.data.user.followers.length);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, currentUser]);

  if (loading) return <div className="text-center pt-20">Loading profile...</div>;
  if (!profileData) return <div className="text-center pt-20">Profile not found</div>;

  const { user, posts } = profileData;
  const isOwnProfile = currentUser?._id === user._id;

  const handleProfilePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageToCrop(url);
    setCropModalOpen(true);
    e.target.value = null; // reset input
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      setIsUploadingPhoto(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      const formData = new FormData();
      formData.append('photo', croppedBlob, 'profile.jpg');

      const res = await api.put('/api/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local state and global context
      setProfileData({ ...profileData, user: res.data });
      login(res.data, localStorage.getItem('token'));
      toast.success('Profile photo updated successfully');
      setCropModalOpen(false);
      setImageToCrop(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return toast.error('You must be logged in to follow');
    try {
      setIsFollowLoading(true);
      const res = await api.put(`/api/users/${user._id}/follow`);
      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followersCount);
      toast.success(res.data.isFollowing ? 'Followed successfully' : 'Unfollowed successfully');
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      bio: user.bio || '',
      location: user.location || '',
      institution: user.institution || '',
      experience: user.experience || '',
      skills: user.skills || []
    });
    setIsEditingProfile(true);
  };

  const handleSkillToggle = (skillName) => {
    setEditFormData(prev => {
      const skills = prev.skills.includes(skillName)
        ? prev.skills.filter(s => s !== skillName)
        : [...prev.skills, skillName];
      return { ...prev, skills };
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/users/profile', editFormData);
      
      // Update AuthContext so the rest of the app reflects the new profile
      login(res.data, localStorage.getItem('token'));
      
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
      window.location.reload(); // Reload to refresh everything smoothly
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    }
  };

  const tabs = ['All', 'Images', 'Videos', 'PDFs'];

  const filteredPosts = activeTab === 'All' 
    ? posts 
    : posts.filter(post => {
        if (activeTab === 'Images') return post.mediaType === 'image' || post.mediaType === 'carousel';
        return post.mediaType + 's' === activeTab.toLowerCase();
      });

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
                onChange={handleProfilePhotoSelect} 
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
              {!isOwnProfile ? (
                <>
                  <button 
                    onClick={handleFollow} 
                    disabled={isFollowLoading}
                    className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-full transition ${
                      isFollowing 
                        ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                    }`}
                  >
                    {isFollowLoading ? <FiLoader className="animate-spin" /> : (isFollowing ? 'Unfollow' : 'Follow')}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-900 font-semibold rounded-full hover:bg-gray-200 transition">
                    <FiMessageSquare /> Message
                  </button>
                </>
              ) : (
                <button onClick={openEditModal} className="flex items-center gap-2 px-6 py-2 border border-[#8B5CF6] text-[#8B5CF6] font-semibold rounded-full hover:bg-gray-50 transition">
                  <FiSettings className="text-xl" /> Edit Profile
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start gap-8 mb-6 font-medium">
            <div className="text-center md:text-left"><span className="font-bold text-xl">{posts.length}</span> posts</div>
            <div className="text-center md:text-left"><span className="font-bold text-xl">{followersCount}</span> followers</div>
            <div className="text-center md:text-left"><span className="font-bold text-xl">{user.following?.length || 0}</span> following</div>
          </div>
          
          {user.bio && <p className="text-gray-700 mb-2">{user.bio}</p>}
          {(user.location || user.institution || user.experience) && (
            <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-4 justify-center md:justify-start">
              {user.location && <span>📍 {user.location}</span>}
              {user.institution && <span>🏫 {user.institution}</span>}
              {user.experience && <span>⭐ {user.experience}</span>}
            </div>
          )}
          {user.skills && user.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{skill}</span>
              ))}
            </div>
          )}
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
            {(post.mediaType === 'image' || post.thumbnailUrl || post.mediaType === 'carousel') && (
              <img src={post.thumbnailUrl || post.mediaUrl || (post.mediaUrls && post.mediaUrls[0])} alt="Gallery item" className="w-full h-full object-contain group-hover:scale-110 transition duration-500" />
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
            {/* Overlay icon for carousels */}
            {post.mediaType === 'carousel' && (
              <div className="absolute top-2 right-2 bg-black/60 rounded p-1 text-white">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="text-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingProfile(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsEditingProfile(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800">
              <FiX className="text-2xl" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea 
                  value={editFormData.bio} 
                  onChange={e => setEditFormData({...editFormData, bio: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6] resize-none h-24"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input type="text" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" placeholder="City, Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Institution</label>
                  <input type="text" value={editFormData.institution} onChange={e => setEditFormData({...editFormData, institution: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" placeholder="Where do you teach?" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience</label>
                <input type="text" value={editFormData.experience} onChange={e => setEditFormData({...editFormData, experience: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#8B5CF6]" placeholder="e.g. 5 Years in Carpentry" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-xl bg-gray-50 custom-scrollbar">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.name)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        editFormData.skills.includes(skill.name) 
                          ? 'bg-[#8B5CF6] text-white shadow-md transform scale-[1.02]' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#8B5CF6] hover:text-[#8B5CF6]'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                  {availableSkills.length === 0 && (
                    <span className="text-sm text-gray-500 w-full text-center py-2">No skills available. Add them on the dashboard first.</span>
                  )}
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-[#8B5CF6] text-gray-900 font-bold rounded-xl hover:bg-[#7C3AED] transition">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Adjust Picture</h2>
            <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden mb-6">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex flex-col gap-2 mb-6 px-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full accent-[#8B5CF6]"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => { setCropModalOpen(false); setImageToCrop(null); }} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCropSave} 
                disabled={isUploadingPhoto}
                className="flex-1 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                {isUploadingPhoto ? <FiLoader className="animate-spin text-xl" /> : 'Save Picture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
