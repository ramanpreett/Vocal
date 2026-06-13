import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiFileText, FiDownload, FiTrash2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PostCard = ({ post, isProfile = false }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
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
      toast.success('Post deleted successfully');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to delete post');
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

  const handleExternalShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.uploadedBy?.username}`,
          text: post.caption,
          url: post.mediaUrl,
        });
      } else {
        await navigator.clipboard.writeText(post.mediaUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openShareModal = async () => {
    setShowShareModal(true);
    setIsFetchingUsers(true);
    try {
      const res = await api.get('/api/users');
      setUsersToShareWith(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleInternalShare = async (recipientId) => {
    try {
      await api.post(`/api/messages/${recipientId}`, { 
        sharedPost: post._id
      });
      toast.success('Resource shared successfully!');
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing resource internally:', error);
      toast.error('Failed to share resource');
    }
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.mediaUrls) setCurrentSlide(prev => (prev === post.mediaUrls.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.mediaUrls) setCurrentSlide(prev => (prev === 0 ? post.mediaUrls.length - 1 : prev - 1));
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
      {post.mediaType === 'carousel' && post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative group overflow-hidden bg-black/5 border-y border-gray-100 h-[400px]">
          <a href={post.mediaUrls[currentSlide]} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
            <img src={post.mediaUrls[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-contain object-center transition-transform duration-300" />
          </a>
          
          {post.mediaUrls.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <button 
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <FiChevronRight className="text-xl" />
              </button>
              
              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                {post.mediaUrls.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                      idx === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {post.mediaType !== 'carousel' && (post.mediaType === 'image' || post.thumbnailUrl) && (
        <div className="relative group overflow-hidden bg-black/5 border-y border-gray-100 cursor-pointer h-[400px]">
          <a href={post.mediaType === 'pdf' ? `https://docs.google.com/viewer?url=${encodeURIComponent(post.mediaUrl)}` : post.mediaUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
            <img src={post.thumbnailUrl || post.mediaUrl} alt="Post media" className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            {/* Overlay indicator */}
            {post.thumbnailUrl && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 text-white text-xs font-bold tracking-wide shadow-lg border border-white/20 hover:bg-black/80 transition-colors flex items-center gap-2">
                {post.mediaType === 'video' ? '▶ VIDEO' : <><FiFileText className="text-sm"/> View Document</>}
              </div>
            )}
          </a>
        </div>
      )}
      {!post.thumbnailUrl && post.mediaType === 'pdf' && (
        <div className="w-full h-[300px] bg-gradient-to-br from-red-50 to-orange-50 border-y border-red-100 flex flex-col items-center justify-center p-6 group">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <FiFileText className="text-4xl text-red-500" />
          </div>
          <p className="font-bold text-xl text-gray-800 mb-2">PDF Document</p>
          <a href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.mediaUrl)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-red-500 font-semibold hover:text-red-600 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow transition-all">
            <FiFileText /> View Document
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
          <button 
            onClick={openShareModal}
            className="text-gray-600 hover:text-[#8B5CF6] group transition-colors"
          >
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
                <img src={c.user?.profilePhoto || `https://ui-avatars.com/api/?name=${c.user?.fullName || c.user?.username || 'U'}&background=random`} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                <p className="text-sm text-gray-800">
                  <span className="font-bold mr-2">{c.user?.username}</span>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleComment} className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.fullName || user?.username || 'U'}&background=random`} className="w-8 h-8 rounded-full object-cover" alt="my-avatar" />
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Share Resource</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto p-2">
              {isFetchingUsers ? (
                <div className="text-center p-4 text-gray-500">Loading contacts...</div>
              ) : (
                usersToShareWith.length > 0 ? (
                  usersToShareWith.map(u => (
                    <div key={u._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer" onClick={() => handleInternalShare(u._id)}>
                      <div className="flex items-center space-x-3">
                        <img src={u.profilePhoto || `https://ui-avatars.com/api/?name=${u.fullName || 'U'}&background=random`} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{u.fullName}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                      <button className="text-[#8B5CF6] text-sm font-bold px-3 py-1 bg-[#8B5CF6]/10 rounded-full hover:bg-[#8B5CF6] hover:text-white transition">
                        Send
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-gray-500">No contacts found.</div>
                )
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={handleExternalShare} className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition">
                <FiShare2 /> Share via OS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
