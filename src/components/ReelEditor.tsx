import React, { useState, useRef, useEffect } from 'react';
import './ReelEditor.css';

export const ReelEditor: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgHeight, setImgHeight] = useState<number>(0);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setOffsetY(0); // Reset position
      };
      reader.readAsDataURL(file);
    }
  };

  // Update image height when loaded
  useEffect(() => {
    if (imgRef.current) {
      setImgHeight(imgRef.current.naturalHeight);
    }
  }, [imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgHeight(e.currentTarget.naturalHeight);
  };

  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOffsetY(Number(event.target.value));
  };

  return (
    <div className="reel-editor-container">
      <div className="editor-layout">
        <div className="reel-section">
          <h3>1. Upload Reel Image</h3>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
          
          {imageSrc && (
            <div className="reel-controls">
              <h3>2. Adjust Position</h3>
              <div className="reel-viewport">
                <img 
                  ref={imgRef}
                  src={imageSrc} 
                  alt="Reel Strip" 
                  style={{ transform: `translateY(-${offsetY}px)` }}
                  onLoad={handleImageLoad}
                  className="reel-image"
                />
                {/* Overlay line to show the "center" or "active" area */}
                <div className="reel-overlay"></div>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max={imgHeight > 0 ? imgHeight - 300 : 100} 
                value={offsetY} 
                onChange={handleSliderChange}
                className="position-slider"
              />
              <p>Offset: {offsetY}px</p>
            </div>
          )}
        </div>

        <div className="description-section">
          <h3>3. Description</h3>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your explanation here..."
            className="description-input"
            rows={10}
          />
        </div>
      </div>
    </div>
  );
};
