import React, { useEffect, useState, useRef } from 'react';
import LearningVideo from '../components/LearningVideo';
import MessageBox from '../components/MessageBox';
import WebcamBox from '../components/WebcamBox';
import EncouragementHandler from '../microadaptations/EncouragementHandler';
import RewindHandler, { useRewind } from '../microadaptations/RewindHandler';
import PauseReflectHandler, { usePauseReflect } from '../microadaptations/PauseReflectHandler';
import QuestionHandler, { useQuestion } from '../microadaptations/QuestionHandler';
import SummaryHandler, { useSummary } from '../microadaptations/SummaryHandler';
import SlowPlaybackHandler, { useSlowPlayback } from '../microadaptations/SlowPlaybackHandler';
import socket from '../services/socket'; // Add socket import
import beginAudio from '../assets/begin.mp3';
import '../styles/LearningPage.css';

const LearningPage: React.FC = () => {
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [videoCanStart, setVideoCanStart] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true); // Track face detection
  const [showFaceDetectionOverlay, setShowFaceDetectionOverlay] = useState(false);
  const [videoPausedForFace, setVideoPausedForFace] = useState(false);
  const beginAudioRef = useRef<HTMLAudioElement>(null);
  const faceDetectionTimeoutRef = useRef<number | null>(null);

  // Add face detection monitoring
  useEffect(() => {
    const handleFaceDetection = (data: any) => {
      const hasDetectedFace = data.hasDetectedFace === 'true';
      setFaceDetected(hasDetectedFace);

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

// Separate component that has access to all contexts
const LearningContent: React.FC<{
  messages: any[];
  triggerEncouragement: () => void;
  addMessage: (text: string, type?: 'system' | 'user' | 'encouragement' | 'rewind' | 'question') => void;
  videoCanStart: boolean;
  showWelcomeOverlay: boolean;
  showCountdown: boolean;
  handleBeginLearning: () => void;
  handleCountdownComplete: () => void;
  videoPausedForFace: boolean;
  showFaceDetectionOverlay: boolean;
  setShowFaceDetectionOverlay: (show: boolean) => void;
  setVideoPausedForFace: (paused: boolean) => void;
}> = ({
  messages,
  triggerEncouragement,
  addMessage,
  videoCanStart,
  showWelcomeOverlay,
  showCountdown,
  handleBeginLearning,
  handleCountdownComplete,
  videoPausedForFace,
  showFaceDetectionOverlay,
  setShowFaceDetectionOverlay,
  setVideoPausedForFace
}) => {
  // Now we can use all the hooks inside the context
  const { triggerRewind, setMessageCallback: setRewindCallback } = useRewind();
  const { triggerPauseReflect } = usePauseReflect();
  const { triggerQuestion, setMessageCallback: setQuestionCallback } = useQuestion();
  const { triggerSummary, setMessageCallback: setSummaryCallback } = useSummary();
  const { triggerSlowPlayback, setMessageCallback: setSlowPlaybackCallback } = useSlowPlayback();

  useEffect(() => {
    // Connect handlers to the message system
    setRewindCallback((message: string) => {
      addMessage(message, 'rewind');
    });
    
    setQuestionCallback((message: string) => {
      addMessage(message, 'question');
    });
    
    setSummaryCallback((message: string) => {
      addMessage(message, 'system');
    });
    
    setSlowPlaybackCallback((message: string) => {
      addMessage(message, 'system');
    });
  }, [setRewindCallback, setQuestionCallback, setSummaryCallback, setSlowPlaybackCallback, addMessage]);

  return (
    <>
      {/* Left Panel: Webcam */}
      <div className="left-panel">
        <div className="user-video-wrapper-container">
          <div className="user-video-wrapper maximized">
            <div className="webcam-container">
              <div className="user-video">
                <WebcamBox />
              </div>
            </div>
          </div>
        </div>
        <MessageBox messages={messages} />
      </div>

      {/* Right Panel: Video and Message Feed */}
      <div className="right-panel">
        <div className="main-video">
          <LearningVideo 
            canStart={videoCanStart}
            showWelcomeOverlay={showWelcomeOverlay}
            showCountdown={showCountdown}
            onBeginLearning={handleBeginLearning}
            onCountdownComplete={handleCountdownComplete}
            pausedForFace={videoPausedForFace}
          />
        </div>
      </div>
      
      {/* Face Detection Overlay */}
      {showFaceDetectionOverlay && (
        <FaceDetectionOverlay 
          onContinue={() => {
            setShowFaceDetectionOverlay(false);
            setVideoPausedForFace(false);
          }}
          triggerRewind={triggerRewind} // Now this works!
        />
      )}
      
      {/* Debug Panel for Testing Microadaptations */}
      <div className="debug-panel">
        <button onClick={triggerRewind}>Rewind to Checkpoint</button>
        <button onClick={triggerPauseReflect}>Pause & Reflect</button>
        <button onClick={triggerSlowPlayback}>Slow Playback</button>
        <button onClick={triggerSummary}>Show Summary</button>
        <button onClick={triggerEncouragement}>Encourage</button>
        <button onClick={triggerQuestion}>Ask Question</button>
      </div>
    </>
  );
};

// Face Detection Overlay Component
const FaceDetectionOverlay: React.FC<{
  onContinue: () => void;
  triggerRewind: () => void;
}> = ({ onContinue, triggerRewind }) => {
  const handleRewindAndContinue = () => {
    triggerRewind(); // This will now work properly
    onContinue();
  };

  return (
    <div className="face-detection-overlay">
      <div className="overlay-content">
        <div className="overlay-icon">👤</div>
        <h2>Face Not Detected</h2>
        <p>
          We can't see your face in the webcam. Please position yourself so your face is clearly visible 
          and try again.
        </p>
        <div className="overlay-actions">
          <button 
            className="continue-btn"
            onClick={onContinue}
          >
            Continue from Here
          </button>
          <button 
            className="rewind-btn"
            onClick={handleRewindAndContinue}
          >
            Go to Last Checkpoint
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;