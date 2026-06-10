import React, { useState } from 'react';

function SinglePreview({ file }) {
  if (file.fileType.startsWith('image/')) {
    return <img src={file.dataUrl} alt={file.fileName || 'Image'} />;
  }
  if (file.fileType.startsWith('video/')) {
    return <video src={file.dataUrl} controls muted />;
  }
  if (file.fileType.includes('pdf')) {
    return (
      <div className="pdf-preview" aria-label="PDF preview">
        <object data={`${file.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`} type="application/pdf">
          <span className="file-badge">PDF</span>
        </object>
      </div>
    );
  }
  return <span className="file-badge">FILE</span>;
}

export function Carousel({ files }) {
  const [index, setIndex] = useState(0);

  if (!files || files.length === 0) return null;

  const downloadIcon = (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  if (files.length === 1) {
    const file = files[0];
    return (
      <div className="single-preview">
        <SinglePreview file={file} />
        <a className="slide-download" href={file.dataUrl} download={file.fileName} title="Download" onClick={(e) => e.stopPropagation()}>
          {downloadIcon}
        </a>
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => Math.min(files.length - 1, prev + 1));
  };

  return (
    <div className="ig-carousel">
      <div className="ig-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {files.map((file, idx) => (
          <div className="ig-slide" key={idx}>
            <SinglePreview file={file} />
            <a className="slide-download" href={file.dataUrl} download={file.fileName} title={`Download slide ${idx + 1}`} onClick={(e) => e.stopPropagation()}>
              {downloadIcon}
            </a>
          </div>
        ))}
      </div>
      {index > 0 && (
        <button className="ig-btn ig-prev" type="button" onClick={handlePrev}>
          &#10094;
        </button>
      )}
      {index < files.length - 1 && (
        <button className="ig-btn ig-next" type="button" onClick={handleNext}>
          &#10095;
        </button>
      )}
      <div className="ig-dots">
        {files.map((_, idx) => (
          <span key={idx} className={`ig-dot ${idx === index ? 'active' : ''}`} />
        ))}
      </div>
      <span className="ig-counter">{index + 1} / {files.length}</span>
    </div>
  );
}
