import React, { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';
import '../styles/LearningPage.css';

const WebcamBox: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [emotions, setEmotions] = useState<any>(null);
  const [hasDetectedFace, setHasDetectedFace] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Listen for connection events
    socket.rawSocket.on('connect', () => {
      console.log('Connected to backend!');
      setIsConnected(true);
    });

    socket.rawSocket.on('disconnect', () => {
      console.log('Disconnected from backend');
      setIsConnected(false);
    });

    // Check if already connected (for cases where connection happened before this component mounted)
    if (socket.connected) {
      setIsConnected(true);
    }

    // Listen for responses from the backend
    socket.rawSocket.on('frame_received', (data) => {
        console.log('Frame analysis result:', data);
        setHasDetectedFace(data.hasDetectedFace === 'true');
        if (data.emotions) {
            setEmotions(data.emotions);
        }
    });

    // Listen for pong responses
    socket.rawSocket.on('pong', () => {
        console.log('Pong received from server');
    });

    // Start webcam
    startWebcam();

    return () => {
        // Clean up socket listeners
        socket.rawSocket.off('connect');
        socket.rawSocket.off('disconnect');
        socket.rawSocket.off('frame_received');
        socket.rawSocket.off('pong');
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          // Start sending frames to backend
          setInterval(captureAndSendFrame, 1000); // Send frame every second
        };
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
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
        const base64Data = dataURL.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        // Send frame to backend
        socket.emit('frame', base64Data);
      }
    }
  };

  // Test connection
  const testConnection = () => {
    socket.emit('ping', 'Hello from frontend!');
  };

  return (
    <div className="user-video-wrapper-outer">
      {/* Add connection status indicator */}
      <div className="connection-status" style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 20,
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: isConnected ? '#4CAF50' : '#f44336',
        color: 'white',
        fontSize: '12px'
      }}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

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
              ref={videoRef} 
              className="webcam" 
              autoPlay 
              muted 
              style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="analysis-results">
        <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <p>Face Detected: {hasDetectedFace ? 'Yes' : 'No'}</p>
        {emotions && (
          <div>
            <h4>Emotions:</h4>
            <ul>
              {Object.entries(emotions).map(([emotion, confidence]) => {
                // Check if confidence is already a percentage (0-100) or a decimal (0-1)
                const percentage = typeof confidence === 'number' 
                  ? confidence > 1 
                    ? confidence.toFixed(1) // Already a percentage
                    : (confidence * 100).toFixed(1) // Convert from decimal to percentage
                  : '0.0';
                
                return (
                  <li key={emotion}>
                    {emotion}: {percentage}%
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={testConnection}>Test Connection</button>
    </div>
  );
};

export default WebcamBox;