import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiImage, FiFileText, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [skill, setSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [preview, setPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/api/skills');
        setAvailableSkills(res.data);
        if (res.data.length > 0) {
          setSkill(res.data[0].name);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selected));
      } else {
        setPreview(null);
      }
    }
  };

  const handleThumbnailChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('image/')) {
      setThumbnailFile(selected);
      setThumbnailPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let mediaType = 'image';
      if (file.type.startsWith('video/')) mediaType = 'video';
      else if (file.type === 'application/pdf') mediaType = 'pdf';

      const formData = new FormData();
      formData.append('mediaType', mediaType);
      formData.append('caption', caption);
      formData.append('skill', skill);
      formData.append('file', file);
      
      if (thumbnailFile && mediaType !== 'image') {
        formData.append('thumbnail', thumbnailFile);
      }

      await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Resource uploaded successfully!');
      setFile(null);
      setThumbnailFile(null);
      setCaption('');
      setPreview(null);
      setThumbnailPreview(null);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload resource.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <h2 className="text-2xl font-bold mb-4">Share a Resource</h2>

      <div className="glass p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-[#8B5CF6] rounded-xl p-6 text-center hover:bg-[#8B5CF6]/5 transition cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf"
            />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
            ) : file ? (
              <div className="flex flex-col items-center">
                <FiFileText className="text-4xl text-[#8B5CF6] mb-2" />
                <p className="text-base font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FiUploadCloud className="text-4xl text-gray-400 mb-2" />
                <p className="text-base font-medium text-gray-700">Click or drag file to upload</p>
                <p className="text-xs text-gray-500 mt-1">Supports Images, PDFs, and Videos</p>
                <div className="flex space-x-4 justify-center mt-4 text-gray-400">
                  <FiImage className="text-xl" />
                  <FiFileText className="text-xl" />
                  <FiVideo className="text-xl" />
                </div>
              </div>
            )}
          </div>

          {file && !file.type.startsWith('image/') && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative mt-2">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleThumbnailChange}
                accept="image/*"
              />
              {thumbnailPreview ? (
                <div className="flex items-center gap-4">
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-12 h-12 object-cover rounded shadow" />
                  <p className="text-gray-700 font-medium text-left flex-1 text-sm">Custom thumbnail selected</p>
                  <button type="button" onClick={(e) => { e.preventDefault(); setThumbnailFile(null); setThumbnailPreview(null); }} className="relative z-20 text-red-500 hover:text-red-600 font-semibold px-2 text-sm">Remove</button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FiImage className="text-2xl text-gray-400 mb-1" />
                  <p className="text-sm text-gray-700 font-medium">Add an optional thumbnail</p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Skill / Category</label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              required
            >
              {availableSkills.length === 0 && <option value="" disabled>No skills available</option>}
              {availableSkills.map(s => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Caption / Description</label>
            <textarea 
              rows="4" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={!file || !skill}
            className={`w-full py-3 rounded-xl font-bold text-base transition ${
              (file && skill) ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Post Resource
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
