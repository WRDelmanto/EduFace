import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Update if using a different backend URL

function useWebcamSocket(videoStarted) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [minimized, setMinimized] = useState(false);
  const [latestResponse, setLatestResponse] = useState(null);
  const [frameCount, setFrameCount] = useState(0);

  const toggleMinimized = () => setMinimized((prev) => !prev);

  // Initialize webcam stream
  useEffect(() => {
    async function getWebcamStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('📷 Webcam stream initialized');
        }
      } catch (err) {
        console.error('❌ Error accessing webcam:', err);
      }
    }

    getWebcamStream();
  }, []);

  // Setup socket connection logging
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to backend');
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from backend');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Frame capture + sending logic
  useEffect(() => {
    if (!videoStarted) return;

    console.log('▶️ Video started — beginning frame capture...');

    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // const imageData = canvas.toDataURL('image/jpeg', 0.7);

      // setFrameCount((prev) => {
      //   const current = prev + 1;

      //   console.log(`📤 Sending frame #${current} to backend`);
      //   console.log('🧩 Base64 preview:', imageData.slice(0, 100) + '...');
      //   console.log('📏 Base64 size:', imageData.length);

      //   socket.emit('frame', { image: imageData }, (response) => {
      //     if (response && typeof response === 'object') {
      //       console.log('📥 Received response from backend:', response);

      //       const { emotion, learning_state, scores } = response;
      //       console.log(`🧠 Emotion: ${emotion}`);
      //       console.log(`🎓 Interpreted Learning State: ${learning_state}`);
      //       console.table(scores);

      //       setLatestResponse(response);
      //     } else {
      //       console.warn('❌ Invalid response from backend');
      //     }
      //   });

      //   return current;
      // });
      setFrameCount((prev) => prev + 1);
    }, 1000); // You can reduce to 500ms or 300ms if needed

    return () => {
      console.log('⏹️ Stopping frame capture');
      clearInterval(interval);
    };
  }, [videoStarted]);

  return { videoRef, canvasRef, minimized, toggleMinimized, latestResponse };
}

export default useWebcamSocket;