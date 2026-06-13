import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiImage, FiFileText, FiVideo, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [skill, setSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [preview, setPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [uploadType, setUploadType] = useState('single'); // 'single' or 'carousel'
  const [carouselFiles, setCarouselFiles] = useState([]);
  const [carouselPreviews, setCarouselPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleCarouselChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      const validFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
      setCarouselFiles(prev => [...prev, ...validFiles].slice(0, 10));
      const newPreviews = validFiles.map(f => URL.createObjectURL(f));
      setCarouselPreviews(prev => [...prev, ...newPreviews].slice(0, 10));
    }
  };

  const removeCarouselFile = (index) => {
    setCarouselFiles(prev => prev.filter((_, i) => i !== index));
    setCarouselPreviews(prev => prev.filter((_, i) => i !== index));
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
    if (isUploading) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('skill', skill);

      if (uploadType === 'single') {
        let mediaType = 'image';
        if (file.type.startsWith('video/')) mediaType = 'video';
        else if (file.type === 'application/pdf') mediaType = 'pdf';
        
        formData.append('mediaType', mediaType);
        formData.append('file', file);
        if (thumbnailFile && mediaType !== 'image') {
          formData.append('thumbnail', thumbnailFile);
        }
      } else {
        formData.append('mediaType', 'carousel');
        const order = carouselFiles.map(f => f.name);
        formData.append('carouselOrder', JSON.stringify(order));
        carouselFiles.forEach(f => formData.append('carouselFiles', f));
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
      setCarouselFiles([]);
      setCarouselPreviews([]);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload resource.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-2">
      <h2 className="text-2xl font-bold mb-4">Share a Resource</h2>

      <div className="glass p-6 rounded-2xl shadow-sm">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button 
            onClick={() => setUploadType('single')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${uploadType === 'single' ? 'bg-white shadow text-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Single File
          </button>
          <button 
            onClick={() => setUploadType('carousel')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${uploadType === 'carousel' ? 'bg-white shadow text-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Image Carousel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {uploadType === 'single' ? (
            <>
              {/* Single File Drop Area */}
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
            </>
          ) : (
            <>
              {/* Carousel Drop Area */}
              <div className="border-2 border-dashed border-[#8B5CF6] rounded-xl p-6 text-center hover:bg-[#8B5CF6]/5 transition cursor-pointer relative">
                <input 
                  type="file" 
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleCarouselChange}
                  accept="image/*"
                />
                <div className="flex flex-col items-center mb-4">
                  <FiImage className="text-4xl text-[#8B5CF6] mb-2" />
                  <p className="text-base font-medium text-gray-700">Click or drag images to add to carousel</p>
                  <p className="text-xs text-gray-500 mt-1">Select up to 10 images</p>
                </div>
                
                {carouselPreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-4 relative z-20">
                    {carouselPreviews.map((preview, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); removeCarouselFile(idx); }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
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
            disabled={isUploading || (uploadType === 'single' && !file) || (uploadType === 'carousel' && carouselFiles.length === 0) || !skill}
            className={`w-full py-3 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 ${
              ((uploadType === 'single' && file) || (uploadType === 'carousel' && carouselFiles.length > 0)) && skill ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <><FiLoader className="animate-spin text-xl" /> Uploading...</>
            ) : (
              'Post Resource'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
