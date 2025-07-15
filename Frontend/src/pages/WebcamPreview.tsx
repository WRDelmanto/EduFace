import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import '../styles/WebcamPreview.css';
import webcamPreviewAudio from '../assets/WebcamPreview.mp3';

const WebcamPreview: React.FC = () => {
  const [isCentered, setIsCentered] = useState(false);
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);
  const [showErrorFlash, setShowErrorFlash] = useState(false); // Add error flash state
  const [countdown, setCountdown] = useState(3);
  const [isCheckingPosition, setIsCheckingPosition] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup socket listeners
    const setupSocket = () => {
      // Listen for frame analysis results
      socket.rawSocket.on('frame_received', (data) => {
        console.log('Frame analysis result:', data);
        const hasDetectedFace = data.hasDetectedFace === 'true';
        setFaceDetected(hasDetectedFace);
        
        // If face is detected and we're not already checking position, start countdown
        if (hasDetectedFace && !isCheckingPosition && !isCentered) {
          startCenteringCountdown();
        }
        
        // If face is not detected, reset centered state and show error flash
        if (!hasDetectedFace) {
          setIsCentered(false);
          setIsCheckingPosition(false);
          setShowSuccessFlash(false);
          
          // Show red flash when face is not detected
          setShowErrorFlash(true);
          setTimeout(() => setShowErrorFlash(false), 1000);
        }
      });
    };

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
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            // Start sending frames to backend after video loads
            startFrameCapture();
          };
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    // Play audio when page loads
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log('Audio autoplay prevented:', error);
        });
      }
    };

    setupSocket();
    startWebcam();
    setTimeout(playAudio, 500);

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      // Clean up socket listeners
      socket.rawSocket.off('frame_received');
    };
  }, []);

  const startFrameCapture = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }
    
    frameIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 2000); // Send frame every 2 seconds
  };

  const captureAndSendFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert canvas to base64 image
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = dataURL.split(',')[1];
        
        // Send frame to backend
        socket.emit('frame', base64Data);
      }
    }
  };

  const startCenteringCountdown = () => {
    if (isCheckingPosition) return; // Prevent multiple countdowns
    
    setIsCheckingPosition(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Flash green and enable button
          setShowSuccessFlash(true);
          setIsCentered(true);
          setIsCheckingPosition(false);
          
          // Remove flash after 3 seconds
          setTimeout(() => setShowSuccessFlash(false), 3000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoToLearning = () => {
    if (isCentered && faceDetected) { // Updated condition
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

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

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
            
            {/* Face detection status indicator */}
            <div className="face-detection-status" style={{
              marginTop: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: faceDetected ? '#4CAF50' : '#f44336', // Red when no face
              color: 'white',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              {faceDetected ? 'Face detected ✓' : 'No face detected ✗'}
            </div>
          </div>

          <div className={`webcam-preview-container ${
            showSuccessFlash ? 'success-flash' : 
            showErrorFlash ? 'error-flash' : ''
          }`}>
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
                ) : isCentered && faceDetected ? (
                  <div className="position-good">
                    <div className="success-icon">✓</div>
                    <span>Perfect! You're centered</span>
                  </div>
                ) : (
                  <span>
                    {!faceDetected 
                      ? 'Please show your face to the camera' 
                      : 'Center yourself in the frame'
                    }
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="status-section">
            <div className={`status-indicator ${(isCentered && faceDetected) ? 'centered' : 'not-centered'}`}>
              <div className="status-dot"></div>
              <span>
                {!faceDetected 
                  ? 'Show your face to the camera' 
                  : isCentered 
                    ? 'Ready to start' 
                    : 'Please center yourself'
                }
              </span>
            </div>
          </div>

          <div className="actions-section">
            <button 
              className={`go-to-learning-btn ${(isCentered && faceDetected) ? 'active' : 'disabled'}`}
              onClick={handleGoToLearning}
              disabled={!isCentered || !faceDetected} // Disabled when no face or not centered
            >
              {(isCentered && faceDetected) ? (
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