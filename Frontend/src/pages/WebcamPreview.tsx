import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WebcamPreview.css';
import webcamPreviewAudio from '../assets/WebcamPreview.mp3'; // Add this import

const WebcamPreview: React.FC = () => {
  const [isCentered, setIsCentered] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCheckingPosition, setIsCheckingPosition] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null); // Add audio ref
  const navigate = useNavigate();

  useEffect(() => {
    // Start webcam
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    startWebcam();

    // Play audio when page loads
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log('Audio autoplay prevented:', error);
        });
      }
    };

    // Small delay to ensure audio is loaded
    setTimeout(playAudio, 500);

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      // Stop audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    // Start position checking after component mounts
    const timer = setTimeout(() => {
      setIsCheckingPosition(true);
      
      // Simulate centering detection with countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Flash green and enable button
            setShowSuccessFlash(true);
            setIsCentered(true);
            setIsCheckingPosition(false);
            
            // Remove flash after 3 seconds (updated for 3 flashes)
            setTimeout(() => setShowSuccessFlash(false), 3000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoToLearning = () => {
    if (isCentered) {
      navigate('/session');
    }
  };

  return (
    <div className="webcam-preview-wrapper">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={webcamPreviewAudio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="webcam-preview-header">
        <h1>Webcam Setup</h1>
        <p>Please center yourself in the frame to continue</p>
      </div>

      <div className="webcam-preview-content">
        <div className="webcam-preview-card">
          <div className="instruction-section">
            <div className="instruction-icon">📹</div>
            <h2>Position Yourself</h2>
            <p>Make sure your face is clearly visible and centered in the webcam preview below.</p>
          </div>

          <div className={`webcam-preview-container ${showSuccessFlash ? 'success-flash' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="webcam-preview-video"
            />
            
            {/* Center guide overlay */}
            <div className="center-guide">
              <div className="guide-circle"></div>
              <div className="guide-text">
                {isCheckingPosition ? (
                  <div className="checking-position">
                    <div className="spinner"></div>
                    <span>Checking position... {countdown}s</span>
                  </div>
                ) : isCentered ? (
                  <div className="position-good">
                    <div className="success-icon">✓</div>
                    <span>Perfect! You're centered</span>
                  </div>
                ) : (
                  <span>Center yourself in the frame</span>
                )}
              </div>
            </div>
          </div>

          <div className="status-section">
            <div className={`status-indicator ${isCentered ? 'centered' : 'not-centered'}`}>
              <div className="status-dot"></div>
              <span>{isCentered ? 'Ready to start' : 'Please center yourself'}</span>
            </div>
          </div>

          <div className="actions-section">
            <button 
              className={`go-to-learning-btn ${isCentered ? 'active' : 'disabled'}`}
              onClick={handleGoToLearning}
              disabled={!isCentered}
            >
              {isCentered ? (
                <>
                  <span>Go to Learning Session</span>
                  <span className="arrow">→</span>
                </>
              ) : (
                <>
                  <span>Go to Learning Session</span>
                  <span className="lock">🔒</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamPreview;