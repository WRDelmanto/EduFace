import React, { useEffect, useState, useRef } from 'react';
import EncouragementHandler from '../microadaptations/EncouragementHandler';
import RewindHandler from '../microadaptations/RewindHandler';
import PauseReflectHandler from '../microadaptations/PauseReflectHandler';
import QuestionHandler from '../microadaptations/QuestionHandler';
import SummaryHandler from '../microadaptations/SummaryHandler';
import SlowPlaybackHandler from '../microadaptations/SlowPlaybackHandler';
import socket from '../services/socket'; // Add socket import
import beginAudio from '../assets/begin.mp3';
import '../styles/LearningPage.css';
import LearningContent from '../components/LearningContent';

const LearningPage: React.FC = () => {
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [videoCanStart, setVideoCanStart] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true); // Track face detection
  const [showFaceDetectionOverlay, setShowFaceDetectionOverlay] = useState(false);
  const [videoPausedForFace, setVideoPausedForFace] = useState(false);
  const [dominantEmotion, setDominantEmotion] = useState<string>(''); // Track dominant emotion
  const [showDebugPanel, setShowDebugPanel] = useState(true); // Add debug panel visibility state
  const beginAudioRef = useRef<HTMLAudioElement>(null);
  const faceDetectionTimeoutRef = useRef<number | null>(null);

  // Add face detection monitoring
  useEffect(() => {
    let lastEmotionLogTime = 0;
    const EMOTION_LOG_THROTTLE = 2000; // Only log emotion changes every 2 seconds
    
    const handleFaceDetection = (data: any) => {
      const hasDetectedFace = data.hasDetectedFace === 'true';
      setFaceDetected(hasDetectedFace);

      let detectedEmotion = '';
      
      // Update dominant emotion if available - check multiple possible data structures
      if (data.dominantEmotion) {
        detectedEmotion = data.dominantEmotion;
        setDominantEmotion(data.dominantEmotion);
      } else if (data.emotion) {
        detectedEmotion = data.emotion;
        setDominantEmotion(data.emotion);
      } else if (data.emotions && data.emotions.dominant) {
        detectedEmotion = data.emotions.dominant;
        setDominantEmotion(data.emotions.dominant);
      } else if (data.emotions && typeof data.emotions === 'object') {
        // Find the emotion with the highest confidence
        const emotions = data.emotions;
        let maxEmotion = '';
        let maxConfidence = 0;
        
        for (const [emotion, confidence] of Object.entries(emotions)) {
          if (typeof confidence === 'number' && confidence > maxConfidence) {
            maxConfidence = confidence;
            maxEmotion = emotion;
          }
        }
        
        if (maxEmotion) {
          detectedEmotion = maxEmotion;
          setDominantEmotion(maxEmotion);
        }
      }

      // Throttle emotion logging to reduce console spam
      const now = Date.now();
      if (detectedEmotion && (now - lastEmotionLogTime) > EMOTION_LOG_THROTTLE) {
        console.log('Current dominant emotion:', detectedEmotion);
        lastEmotionLogTime = now;
      }

      // Log the data structure to debug
      // console.log('Face detection data:', data);

      if (hasDetectedFace) {
        // Face detected - clear timeout and hide overlay
        if (faceDetectionTimeoutRef.current) {
          clearTimeout(faceDetectionTimeoutRef.current);
          faceDetectionTimeoutRef.current = null;
        }
        setShowFaceDetectionOverlay(false);
      } else {
        // No face detected - start timeout
        if (!faceDetectionTimeoutRef.current && videoCanStart) {
          faceDetectionTimeoutRef.current = setTimeout(() => {
            setShowFaceDetectionOverlay(true);
            setVideoPausedForFace(true);
          }, 3000); // Wait 3 seconds before showing overlay
        }
      }
    };

    // Listen for face detection updates
    socket.rawSocket.on('frame_received', handleFaceDetection);

    return () => {
      socket.rawSocket.off('frame_received', handleFaceDetection);
      if (faceDetectionTimeoutRef.current) {
        clearTimeout(faceDetectionTimeoutRef.current);
      }
    };
  }, [videoCanStart]);

  const handleBeginLearning = () => {
    // Play begin audio first
    if (beginAudioRef.current) {
      beginAudioRef.current.play().catch(error => {
        console.log('Audio play prevented:', error);
        // If audio fails, start countdown immediately
        setShowWelcomeOverlay(false);
        setShowCountdown(true);
      });
      
      // Listen for audio end event to start countdown with small delay
      beginAudioRef.current.onended = () => {
        setTimeout(() => {
          setShowWelcomeOverlay(false);
          setShowCountdown(true);
        }, 500); // 500ms delay after audio ends
      };
    } else {
      // If no audio ref, start countdown immediately
      setShowWelcomeOverlay(false);
      setShowCountdown(true);
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setVideoCanStart(true);
  };

  return (
    <div className="learning-wrapper">
      {/* Hidden audio element for begin sound */}
      <audio
        ref={beginAudioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={beginAudio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <RewindHandler>
        <PauseReflectHandler>
          <QuestionHandler>
            <SummaryHandler>
              <SlowPlaybackHandler>
                <EncouragementHandler>
                  {({ messages, triggerEncouragement, addMessage }) => (
                    <LearningContent
                      messages={messages}
                      triggerEncouragement={triggerEncouragement}
                      addMessage={addMessage}
                      videoCanStart={videoCanStart}
                      showWelcomeOverlay={showWelcomeOverlay}
                      showCountdown={showCountdown}
                      handleBeginLearning={handleBeginLearning}
                      handleCountdownComplete={handleCountdownComplete}
                      videoPausedForFace={videoPausedForFace}
                      showFaceDetectionOverlay={showFaceDetectionOverlay}
                      setShowFaceDetectionOverlay={setShowFaceDetectionOverlay}
                      setVideoPausedForFace={setVideoPausedForFace}
                      dominantEmotion={dominantEmotion}
                      showDebugPanel={showDebugPanel}
                      setShowDebugPanel={setShowDebugPanel}
                    />
                  )}
                </EncouragementHandler>
              </SlowPlaybackHandler>
            </SummaryHandler>
          </QuestionHandler>
        </PauseReflectHandler>
      </RewindHandler>
    </div>
  );
};

export default LearningPage;