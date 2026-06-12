import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiFileText, FiDownload, FiTrash2 } from 'react-icons/fi';

const PostCard = ({ post, isProfile = false }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isLiked = likes.includes(user?._id);

  const handleLike = async () => {
    try {
      const res = await api.put(`/api/posts/${post._id}/like`);
      setLikes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/api/posts/${post._id}/comment`, { text: commentText });
      setComments(res.data);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/posts/${post._id}`);
      window.location.reload();
    } catch (err) {
      alert('Failed to delete post');
      console.error(err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
      {/* Post Header */}
      <div className="p-5 flex items-center justify-between">
        <Link to={`/profile/${post.uploadedBy?.username}`} className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <img src={post.uploadedBy?.profilePhoto || `https://ui-avatars.com/api/?name=${post.uploadedBy?.fullName || 'U'}&background=random`} alt="avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#8B5CF6] transition-all" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <p className="font-bold text-gray-900 group-hover:text-[#8B5CF6] transition-colors">{post.uploadedBy?.fullName}</p>
            <p className="text-xs text-gray-500 font-medium">@{post.uploadedBy?.username} • {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
          </div>
        </Link>
        {isProfile && user?._id === post.uploadedBy?._id && (
          <button onClick={handleDeleteClick} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition" title="Delete Post">
            <FiTrash2 className="text-xl" />
          </button>
        )}
      </div>
      
      {/* Post Media */}
      {(post.mediaType === 'image' || post.thumbnailUrl) && (
        <div className="relative group overflow-hidden bg-gray-50 border-y border-gray-100 cursor-pointer aspect-square">
          <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
            <img src={post.thumbnailUrl || post.mediaUrl} alt="Post media" className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            {/* If it's a video/pdf with a thumbnail, add an overlay indicator */}
            {post.thumbnailUrl && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 text-white text-xs font-bold tracking-wide shadow-lg border border-white/20">
                {post.mediaType === 'video' ? '▶ VIDEO' : '📄 PDF DOCUMENT'}
              </div>
            )}
          </a>
        </div>
      )}
      {!post.thumbnailUrl && post.mediaType === 'pdf' && (
        <div className="w-full aspect-square bg-gradient-to-br from-red-50 to-orange-50 border-y border-red-100 flex flex-col items-center justify-center p-6 group">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <FiFileText className="text-4xl text-red-500" />
          </div>
          <p className="font-bold text-xl text-gray-800 mb-2">PDF Document</p>
          <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-600 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow transition-all">
            <FiDownload /> Click to view
          </a>
        </div>
      )}
      
      {/* Interaction Actions */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
          >
            <FiHeart className={`text-2xl transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium text-sm">{likes.length}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#8B5CF6] group transition-colors"
          >
            <FiMessageCircle className="text-2xl group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-sm">{comments.length}</span>
          </button>
          <button className="text-gray-600 hover:text-[#8B5CF6] group transition-colors">
            <FiShare2 className="text-2xl group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
        <button className="text-gray-600 hover:text-gray-900 group transition-colors">
          <FiBookmark className="text-2xl group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>

      {/* Caption Area */}
      <div className="px-5 pb-4">
        <p className="text-gray-800 text-[15px] leading-relaxed">
          <span className="font-bold mr-2 text-gray-900">{post.uploadedBy?.username}</span>
          {post.caption}
        </p>
        {comments.length > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-sm text-gray-500 mt-2 font-medium hover:text-gray-800 transition-colors">
            View all {comments.length} comments
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-4 space-y-3">
          <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {comments.map((c, i) => (
              <div key={i} className="flex space-x-2">
                <img src={c.user?.profilePhoto || `https://ui-avatars.com/api/?name=${c.user?.username || 'U'}`} className="w-6 h-6 rounded-full" alt="avatar" />
                <p className="text-sm text-gray-800">
                  <span className="font-bold mr-2">{c.user?.username}</span>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleComment} className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.username || 'U'}`} className="w-8 h-8 rounded-full" alt="my-avatar" />
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
            />
            <button type="submit" disabled={!commentText.trim()} className="text-[#8B5CF6] font-semibold text-sm disabled:opacity-50">Post</button>
          </form>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-3xl text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Resource?</h3>
            <p className="text-gray-500 mb-8">This action cannot be undone. Are you sure you want to permanently delete this post?</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
