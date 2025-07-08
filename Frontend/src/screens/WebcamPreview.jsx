import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import '../css/WebcamPreview.css';
import { useNavigate } from 'react-router-dom';

function WebcamPreview() {
  const videoRef = useRef(null);
  const boxRef = useRef(null);
  const [centered, setCentered] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [flash, setFlash] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let centerTimer = null;
    let flashTimeout = null;

    async function loadModelsAndStream() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      detectLoop();
    }

    async function detectLoop() {
      const video = videoRef.current;
      if (!video) return;

      const interval = setInterval(async () => {
        const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

        if (result) {
          const box = result.box;
          const centerX = video.videoWidth / 2;
          const centerY = video.videoHeight / 2;
          const faceCenterX = box.x + box.width / 2;
          const faceCenterY = box.y + box.height / 2;
          const tolerance = 60;

          const isCentered =
            Math.abs(centerX - faceCenterX) < tolerance &&
            Math.abs(centerY - faceCenterY) < tolerance;

          setCentered(isCentered);
          console.log(`✅ Face detected. Centered: ${isCentered}`);

          if (isCentered && !confirmed) {
            if (!centerTimer) {
              centerTimer = setTimeout(() => {
                setFlash(true);
                flashTimeout = setTimeout(() => {
                  setFlash(false);
                  setConfirmed(true);
                }, 3000); // 3s for flashing animation
              }, 3000); // 3s of stable centering
            }
          } else {
            clearTimeout(centerTimer);
            centerTimer = null;
          }
        } else {
          console.log('❌ No face detected.');
          setCentered(false);
          clearTimeout(centerTimer);
          centerTimer = null;
        }
      }, 300);

      return () => {
        clearInterval(interval);
        clearTimeout(centerTimer);
        clearTimeout(flashTimeout);
      };
    }

    loadModelsAndStream();
  }, [confirmed]);

  return (
    <div className="webcam-preview-wrapper">
      <div className="instruction-text">
        <h2>Center Yourself in the Frame</h2>
        <p>Please align your face within the box. This helps us track your focus accurately.</p>
      </div>

      {confirmed && (
        <p className="confirmation-message">
          ✅ Face centered and confirmed!
        </p>
      )}

      <div className={`webcam-box ${flash ? 'flash-shadow' : ''}`} ref={boxRef}>
        <video ref={videoRef} autoPlay muted playsInline className="webcam-feed" />
        <div className="center-box" />
      </div>

      <button
        className={`next-button ${confirmed ? 'active' : ''}`}
        disabled={!confirmed}
        onClick={() => navigate('/session')}
      >
        Next
      </button>
    </div>
  );
}

export default WebcamPreview;