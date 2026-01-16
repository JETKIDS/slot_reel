import React, { useState, useRef, useEffect } from 'react';
import './ReelEditor.css';

export const ReelEditor: React.FC = () => {
  // Constants for Pachislot Reel
  const VISIBLE_FRAMES = 3;
  const TOTAL_FRAMES = 21;
  const RENDERED_REEL_WIDTH = 100; // Fixed by CSS

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<[number, number, number]>([0, 0, 0]);
  const [description, setDescription] = useState<string>('');
  
  // Dynamic dimensions based on image aspect ratio
  const [dimensions, setDimensions] = useState({
    viewportHeight: 300,
    totalHeight: 2100,
    frameHeight: 100
  });

  const imgRef = useRef<HTMLImageElement>(null);
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setOffsets([0, 0, 0]); // Reset positions
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate dimensions logic extracted for reuse
  const calculateDimensions = (img: HTMLImageElement) => {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Calculate aspect ratio of a single frame
    const singleReelWidth = naturalWidth / 3;
    const singleFrameHeight = naturalHeight / TOTAL_FRAMES;
    const aspectRatio = singleFrameHeight / singleReelWidth;
    
    // Calculate rendered dimensions based on fixed width (100px)
    const renderedFrameHeight = RENDERED_REEL_WIDTH * aspectRatio;
    // Viewport shows 3 full frames + 0.5 frame padding on top and bottom (total 4 frames height)
    const renderedViewportHeight = renderedFrameHeight * (VISIBLE_FRAMES + 1); 
    const renderedTotalHeight = renderedFrameHeight * TOTAL_FRAMES;
    
    setDimensions({
      viewportHeight: renderedViewportHeight,
      totalHeight: renderedTotalHeight,
      frameHeight: renderedFrameHeight
    });
  };

  // Calculate dimensions when image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    calculateDimensions(e.currentTarget);
  };

  // Ensure dimensions are calculated if image is already loaded (e.g. from cache)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      calculateDimensions(imgRef.current);
    }
  }, [imageSrc]);

  // Handle slider change for specific reel
  const handleSliderChange = (index: number, value: number) => {
    const newOffsets = [...offsets] as [number, number, number];
    newOffsets[index] = value;
    setOffsets(newOffsets);
  };

  // Handle nudge (1 frame step) with looping
  const handleNudge = (index: number, direction: 'up' | 'down') => {
    const currentOffset = offsets[index];
    const step = direction === 'up' ? -dimensions.frameHeight : dimensions.frameHeight;
    const maxOffset = dimensions.totalHeight;
    
    // Loop logic using modulo
    // We add maxOffset before modulo to handle negative results correctly
    let newOffset = (currentOffset + step) % maxOffset;
    if (newOffset < 0) newOffset += maxOffset;
    
    handleSliderChange(index, newOffset);
  };

  return (
    <div className="reel-editor-container">
      <div className="editor-layout">
        <div className="reel-section">
          <h3>1. Upload Reel Image</h3>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
          
          {/* Hidden image for dimension calculation */}
          {imageSrc && (
            <img 
              src={imageSrc} 
              alt="Hidden Calc" 
              style={{ display: 'none' }} 
              onLoad={handleImageLoad} 
            />
          )}
          
          {imageSrc && (
            <div className="reel-controls">
              <h3>2. Adjust Position (Left / Center / Right)</h3>
              
              <div className="slot-machine-display">
                {[0, 1, 2].map((reelIndex) => (
                  <div key={reelIndex} className="reel-column">
                    <div className="single-reel-viewport" style={{ height: `${dimensions.viewportHeight}px` }}>
                      {/* Background Image implementation for looping */}
                      <div 
                        className="reel-strip-bg"
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${imageSrc})`,
                          backgroundRepeat: 'repeat-y',
                          // width is 300% of container, height is fixed to calculated total height to match pixel precision
                          backgroundSize: `300% ${dimensions.totalHeight}px`,
                          // X position: 0% (Left), 50% (Center), 100% (Right)
                          // Y position: Shifted by offset + padding for centering
                          // Padding is 0.5 frame height to start rendering 0.5 frame down
                          backgroundPosition: `${reelIndex * 50}% ${dimensions.frameHeight * 0.5 - offsets[reelIndex]}px`
                        }}
                      />
                      
                      {/* Visual Mask to highlight main 3 frames */}
                      <div 
                        className="reel-mask-top" 
                        style={{ height: `${dimensions.frameHeight * 0.5}px` }}
                      ></div>
                      <div 
                        className="reel-mask-bottom" 
                        style={{ height: `${dimensions.frameHeight * 0.5}px` }}
                      ></div>
                    </div>
                    
                    <div className="nudge-controls">
                      <button onClick={() => handleNudge(reelIndex, 'up')}>▲</button>
                      <button onClick={() => handleNudge(reelIndex, 'down')}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="sliders-container">
                {['Left', 'Center', 'Right'].map((label, index) => (
                  <div key={label} className="slider-group">
                    <label>{label}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max={dimensions.totalHeight} 
                      step={dimensions.frameHeight / 10} // Allow finer control than just 1 frame if dragging
                      value={offsets[index]} 
                      onChange={(e) => handleSliderChange(index, Number(e.target.value))}
                      className="position-slider"
                    />
                    <span>{(offsets[index] / dimensions.frameHeight).toFixed(1)}コマ</span>
                  </div>
                ))}
              </div>
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
