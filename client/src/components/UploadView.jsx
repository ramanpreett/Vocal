import React, { useState } from 'react';

function detectFileType(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  if (lowerName.endsWith(".mp4")) return "video/mp4";
  if (lowerName.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UploadView({ 
  subjects, 
  activeSubject, 
  uploadResource,
  setActiveView,
  setActiveSubject
}) {
  const [files, setFiles] = useState([]);
  const [subject, setSubject] = useState(
    activeSubject !== 'All Subjects' && subjects.includes(activeSubject) ? activeSubject : subjects[0] || ''
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    const filesArray = [];
    for (const file of files) {
      filesArray.push({
        fileName: file.name,
        fileType: file.type || detectFileType(file.name),
        dataUrl: await readFileAsDataUrl(file),
      });
    }

    const resource = await uploadResource({
      subject,
      title: title.trim(),
      description: description.trim(),
      files: filesArray,
    });

    if (resource) {
      setActiveSubject(resource.subject);
      setActiveView('dashboard');
      setFiles([]);
      setTitle('');
      setDescription('');
    }
  };

  let fileLabel = 'Choose teaching content';
  if (files.length === 1) fileLabel = files[0].name;
  else if (files.length > 1) fileLabel = `${files.length} files selected`;

  return (
    <section className="upload-screen" aria-labelledby="uploadTitle">
      <div className="upload-header">
        <div>
          <p className="eyebrow">New post</p>
          <h2 id="uploadTitle">Share a teaching resource</h2>
        </div>
        <span id="uploadHint">PDF, image, diagram, or video</span>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="media-picker">
          <input 
            type="file" 
            accept="application/pdf,image/*,video/*" 
            multiple 
            required 
            onChange={handleFileChange}
          />
          <span className="media-picker-icon">+</span>
          <strong>{fileLabel}</strong>
          <small>Upload a PDF handout, workshop diagram, photo, or video lesson.</small>
        </label>

        <div className="upload-details">
          <label>
            Subject
            <select required value={subject} onChange={e => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Title
            <input 
              type="text" 
              placeholder="Lesson title" 
              required 
              maxLength="80" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </label>
          <label className="wide">
            Description
            <textarea 
              placeholder="What should students or teachers know about this resource?" 
              maxLength="240"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>
        </div>
        <button className="primary-button" type="submit">Upload content</button>
      </form>
    </section>
  );
}
