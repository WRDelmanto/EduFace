import React, { useEffect, useRef, useState } from 'react';
import '../styles/LearningPage.css';

const WebcamBox: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    });
  }, []);

  return (
    <div className="user-video-wrapper-outer">
      <button
        className="minimize-button"
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 20
        }}
        onClick={() => setMinimized((prev) => !prev)}
        aria-label={minimized ? 'Show webcam' : 'Hide webcam'}
      >
        {minimized ? 'Show Webcam' : 'Hide Webcam'}
      </button>

      <div className="user-video-wrapper-container">
        <div className={`user-video-wrapper ${minimized ? 'minimized' : 'maximized'}`}>
          <div className="webcam-container">
            <video 
              ref={webcamRef} 
              className="webcam" 
              autoPlay 
              muted 
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamBox;