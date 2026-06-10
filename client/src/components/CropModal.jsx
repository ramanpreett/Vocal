import React, { useEffect, useRef } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

export function CropModal({ file, onSave, onCancel }) {
  const imageRef = useRef(null);
  const cropperRef = useRef(null);
  const [dataUrl, setDataUrl] = React.useState('');

  useEffect(() => {
    if (!file) return;
    
    document.body.classList.add('modal-open');
    
    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(reader.result);
    };
    reader.readAsDataURL(file);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [file]);

  useEffect(() => {
    if (dataUrl && imageRef.current) {
      if (cropperRef.current) cropperRef.current.destroy();
      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
      });
    }

    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [dataUrl]);

  if (!file || !dataUrl) return null;

  const handleSave = () => {
    if (!cropperRef.current) return;
    const canvas = cropperRef.current.getCroppedCanvas({ width: 400, height: 400 });
    const url = canvas.toDataURL("image/jpeg", 0.9);
    onSave(url);
  };

  return (
    <div className="post-modal">
      <div className="post-modal-backdrop" onClick={onCancel}></div>
      <div className="post-modal-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', zIndex: 10 }}>
        <h2 style={{ marginBottom: '16px' }}>Crop Profile Picture</h2>
        <div className="crop-container">
          <img ref={imageRef} src={dataUrl} style={{ display: 'block', maxWidth: '100%' }} alt="Crop preview" />
        </div>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px', justifyContent: 'flex-end' }}>
          <button className="secondary-button" type="button" style={{ width: 'auto' }} onClick={onCancel}>Cancel</button>
          <button className="primary-button" type="button" style={{ width: 'auto' }} onClick={handleSave}>Save Picture</button>
        </div>
      </div>
    </div>
  );
}
