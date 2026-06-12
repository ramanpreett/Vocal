import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FiImage, FiFileText, FiVideo } from 'react-icons/fi';
import PostCard from '../components/PostCard';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ topContributors: [], trendingSkills: [] });
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [feedFilter, setFeedFilter] = useState('all');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [postsRes, statsRes] = await Promise.all([
        api.get(`/api/posts/feed?filter=${feedFilter}`),
        api.get('/api/posts/stats')
      ]);
      setPosts(postsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [feedFilter]);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await api.post('/api/skills', { name: newSkill.trim() });
      setNewSkill('');
      fetchData(); // Refresh to potentially show new skill in trending if it gets used, though it won't be trending until used.
      toast.success('Skill created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create skill');
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-20 pt-8 flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center">
        <div className="flex-1 max-w-2xl w-full space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-3xl p-4 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="w-full h-[400px] bg-gray-200 rounded-2xl mb-4"></div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block w-[350px] space-y-8 sticky top-6 self-start">
          <div className="glass rounded-3xl p-6 h-64 animate-pulse bg-white/50"></div>
          <div className="glass rounded-3xl p-6 h-64 animate-pulse bg-white/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-24 pt-6 flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center">
      {/* Left Column - Feed */}
      <div className="flex-1 max-w-2xl w-full">
        {/* Inline Upload Widget */}
        <div className="glass bg-white rounded-3xl p-5 mb-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:shadow-md transition" onClick={() => navigate('/upload')}>
          <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.fullName || 'U'}`} alt="avatar" className="w-12 h-12 rounded-full object-cover hidden sm:block" />
          <div className="flex-1 bg-gray-50 hover:bg-gray-100 transition rounded-full px-6 py-3 w-full">
            <p className="text-gray-500 font-medium">Share a resource, document, or video...</p>
          </div>
          <div className="flex items-center gap-4 text-gray-400 mt-4 sm:mt-0 px-2 w-full sm:w-auto justify-around">
            <div className="flex items-center gap-1.5 hover:text-[#8B5CF6] transition">
              <FiImage className="text-xl" />
              <span className="text-sm font-medium hidden sm:block">Image</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-red-500 transition">
              <FiFileText className="text-xl" />
              <span className="text-sm font-medium hidden sm:block">PDF</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-blue-500 transition">
              <FiVideo className="text-xl" />
              <span className="text-sm font-medium hidden sm:block">Video</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6 px-2 mt-8">
          <h2 className="text-2xl font-bold">Feed</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setFeedFilter('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${feedFilter === 'all' ? 'bg-white shadow text-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Posts
            </button>
            <button 
              onClick={() => setFeedFilter('my-skills')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${feedFilter === 'my-skills' ? 'bg-white shadow text-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Skills
            </button>
          </div>
        </div>

        <div className="space-y-10">
          {posts.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mb-4">
                <FiFileText className="text-3xl text-[#8B5CF6]" />
              </div>
              <h3 className="text-xl font-bold mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to upload a resource and start collaborating!</p>
            </div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </div>

      {/* Right Column - Widgets */}
      <div className="hidden lg:block w-[350px] space-y-8 sticky top-6 self-start">
        {/* Top Contributors Widget */}
        <div className="glass bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-[#8B5CF6] w-2 h-6 rounded-full mr-3"></span>
            Top Contributors
          </h3>
          <div className="space-y-4">
            {stats.topContributors.length === 0 ? (
              <p className="text-sm text-gray-500">No contributors yet.</p>
            ) : (
              stats.topContributors.map((c, i) => (
                <div key={c._id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <img src={c.user.profilePhoto || `https://ui-avatars.com/api/?name=${c.user.fullName || 'U'}`} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#8B5CF6] transition-colors">{c.user.fullName}</p>
                      <p className="text-xs text-gray-500">@{c.user.username}</p>
                    </div>
                  </div>
                  <div className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full">
                    {c.count} {c.count === 1 ? 'post' : 'posts'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trending Skills Widget */}
        <div className="glass bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-[#98CE00] w-2 h-6 rounded-full mr-3"></span>
            Trending Skills
          </h3>
          <div className="space-y-3">
            {stats.trendingSkills.length === 0 ? (
              <p className="text-sm text-gray-500">No trending skills yet.</p>
            ) : (
              stats.trendingSkills.map((s, i) => (
                <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-[#8B5CF6] font-bold">#{i + 1}</span>
                    <span className="font-semibold text-gray-800">{s._id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Skill Widget */}
        <div className="glass bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-[#8B5CF6] w-2 h-6 rounded-full mr-3"></span>
            Add New Skill
          </h3>
          <form onSubmit={handleCreateSkill} className="space-y-3">
            <input 
              type="text" 
              placeholder="E.g., Machine Learning" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition text-sm"
            />
            <button 
              type="submit" 
              disabled={!newSkill.trim()}
              className="w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 font-bold rounded-xl transition disabled:opacity-50 text-sm"
            >
              Create Skill
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
