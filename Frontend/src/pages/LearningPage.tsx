import React, { useEffect, useState, useRef } from 'react';
import LearningVideo from '../components/LearningVideo';
import MessageBox from '../components/MessageBox';
import WebcamBox from '../components/WebcamBox';
import DebugPanel from '../components/DebugPanel';
import EncouragementHandler from '../microadaptations/EncouragementHandler';
import RewindHandler, { useRewind } from '../microadaptations/RewindHandler';
import PauseReflectHandler, { usePauseReflect } from '../microadaptations/PauseReflectHandler';
import QuestionHandler, { useQuestion } from '../microadaptations/QuestionHandler';
import SummaryHandler, { useSummary } from '../microadaptations/SummaryHandler';
import SlowPlaybackHandler, { useSlowPlayback } from '../microadaptations/SlowPlaybackHandler';
import socket from '../services/socket'; // Add socket import
import beginAudio from '../assets/begin.mp3';
import '../styles/LearningPage.css';

// Map basic emotion to learning state
function mapEmotionToLearningState(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case 'happy':
    case 'surprise':
      return 'engagement';
    case 'neutral':
    case 'disgust':
      return 'disengagement';
    case 'sad':
    case 'fear':
      return 'confusion';
    case 'angry':
      return 'frustration';
    default:
      return 'engagement'; // Default to engagement for unknown emotions
  }
}

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
  dominantEmotion: string;
  showDebugPanel: boolean;
  setShowDebugPanel: (show: boolean) => void;
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
  setVideoPausedForFace,
  dominantEmotion,
  showDebugPanel,
  setShowDebugPanel
}) => {
  // Now we can use all the hooks inside the context
  const { triggerRewind, setMessageCallback: setRewindCallback } = useRewind();
  const { triggerPauseReflect } = usePauseReflect();
  const { triggerQuestion, setMessageCallback: setQuestionCallback } = useQuestion();
  const { triggerSummary, setMessageCallback: setSummaryCallback } = useSummary();
  const { triggerSlowPlayback, setMessageCallback: setSlowPlaybackCallback } = useSlowPlayback();

  // Set up message callbacks for microadaptations (only once)
  React.useEffect(() => {
    console.log('Setting up message callbacks');
    
    // Create throttled version of addMessage to prevent spam
    const throttledAddMessage = (text: string, type?: 'system' | 'user' | 'encouragement' | 'rewind' | 'question') => {
      console.log('Message callback called:', text, type);
      addMessage(text, type);
    };
    
    setQuestionCallback(throttledAddMessage);
    setRewindCallback(throttledAddMessage);
    setSummaryCallback(throttledAddMessage);
    setSlowPlaybackCallback(throttledAddMessage);
  }, []); // Remove dependencies to prevent constant re-setup

  // Track when video actually starts and emotion reaction state
  const [videoStartTime, setVideoStartTime] = useState<number | null>(null);
  const [lastEmotionReactionTime, setLastEmotionReactionTime] = useState<number>(0);
  const [emotionStartTime, setEmotionStartTime] = useState<number | null>(null);
  const [persistentEmotion, setPersistentEmotion] = useState<string>('');
  const [emotionDuration, setEmotionDuration] = useState<number>(0);
  const [rewindCooldown, setRewindCooldown] = useState<number>(0);
  const [pauseReflectCooldown, setPauseReflectCooldown] = useState<number>(0);
  const [slowPlaybackCooldown, setSlowPlaybackCooldown] = useState<number>(0);
  const [summaryCooldown, setSummaryCooldown] = useState<number>(0);
  const [encouragementCooldown, setEncouragementCooldown] = useState<number>(0);
  const [questionCooldown, setQuestionCooldown] = useState<number>(0);
  const [lastRewindTrigger, setLastRewindTrigger] = useState<number>(0);
  const [lastPauseReflectTrigger, setLastPauseReflectTrigger] = useState<number>(0);
  const [lastSlowPlaybackTrigger, setLastSlowPlaybackTrigger] = useState<number>(0);
  const [lastSummaryTrigger, setLastSummaryTrigger] = useState<number>(0);
  const [lastEncouragementTrigger, setLastEncouragementTrigger] = useState<number>(0);
  const [lastQuestionTrigger, setLastQuestionTrigger] = useState<number>(0);
  const emotionCheckIntervalRef = useRef<number | null>(null);
  const durationUpdateIntervalRef = useRef<number | null>(null);
  const cooldownUpdateIntervalRef = useRef<number | null>(null);
  const emotionStartTimeRef = useRef<number | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const persistentEmotionRef = useRef<string>('');

  // Add webcam analysis state
  const [webcamAnalysis, setWebcamAnalysis] = useState({
    isConnected: false,
    hasDetectedFace: false,
    emotions: null,
    testConnection: () => {}
  });

  const [messageList, setMessageList] = useState(messages);

  useEffect(() => {
    setMessageList(messages);
  }, [messages]);

  const clearMessages = () => {
    setMessageList([]);
  };

  // Set video start time when video can start
  useEffect(() => {
    if (videoCanStart && !videoStartTime) {
      const startTime = Date.now();
      setVideoStartTime(startTime);
      videoStartTimeRef.current = startTime;
    }
  }, [videoCanStart, videoStartTime]);

  // Track emotion changes and start duration tracking
  useEffect(() => {
    if (!dominantEmotion) {
      setEmotionStartTime(null);
      emotionStartTimeRef.current = null;
      setPersistentEmotion('');
      persistentEmotionRef.current = '';
      setEmotionDuration(0);
      if (durationUpdateIntervalRef.current) {
        clearInterval(durationUpdateIntervalRef.current);
        durationUpdateIntervalRef.current = null;
      }
      return;
    }

    if (dominantEmotion === persistentEmotion) {
      // Same emotion continuing - keep tracking
      return;
    }

    // New emotion detected
    setPersistentEmotion(dominantEmotion);
    persistentEmotionRef.current = dominantEmotion;
    const newStartTime = Date.now();
    setEmotionStartTime(newStartTime);
    emotionStartTimeRef.current = newStartTime;
    setEmotionDuration(0);

    // Clear existing duration interval
    if (durationUpdateIntervalRef.current) {
      clearInterval(durationUpdateIntervalRef.current);
    }

    // Start updating emotion duration every 500ms (instead of 100ms to reduce UI updates)
    durationUpdateIntervalRef.current = setInterval(() => {
      if (emotionStartTimeRef.current) {
        const currentDuration = Date.now() - emotionStartTimeRef.current;
        setEmotionDuration(currentDuration);
      }
    }, 500); // Reduced from 100ms to 500ms

  }, [dominantEmotion, persistentEmotion]);

  // Track cooldown timers for all adaptations
  useEffect(() => {
    if (cooldownUpdateIntervalRef.current) {
      clearInterval(cooldownUpdateIntervalRef.current);
    }

    cooldownUpdateIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const reactionCooldown = 30 * 1000; // 30 seconds

      // Update all adaptation cooldowns
      setRewindCooldown(Math.max(0, reactionCooldown - (currentTime - lastRewindTrigger)));
      setPauseReflectCooldown(Math.max(0, reactionCooldown - (currentTime - lastPauseReflectTrigger)));
      setSlowPlaybackCooldown(Math.max(0, reactionCooldown - (currentTime - lastSlowPlaybackTrigger)));
      setSummaryCooldown(Math.max(0, reactionCooldown - (currentTime - lastSummaryTrigger)));
      setEncouragementCooldown(Math.max(0, reactionCooldown - (currentTime - lastEncouragementTrigger)));
      setQuestionCooldown(Math.max(0, reactionCooldown - (currentTime - lastQuestionTrigger)));
    }, 100);

    return () => {
      if (cooldownUpdateIntervalRef.current) {
        clearInterval(cooldownUpdateIntervalRef.current);
      }
    };
  }, [lastRewindTrigger, lastPauseReflectTrigger, lastSlowPlaybackTrigger, lastSummaryTrigger, lastEncouragementTrigger, lastQuestionTrigger]);

  // Wrap adaptation triggers to track timing
  const wrappedTriggerRewind = () => {
    setLastRewindTrigger(Date.now());
    triggerRewind();
  };

  const wrappedTriggerPauseReflect = () => {
    setLastPauseReflectTrigger(Date.now());
    triggerPauseReflect();
  };

  const wrappedTriggerSlowPlayback = () => {
    setLastSlowPlaybackTrigger(Date.now());
    triggerSlowPlayback();
  };

  const wrappedTriggerSummary = () => {
    setLastSummaryTrigger(Date.now());
    triggerSummary();
  };

  const wrappedTriggerEncouragement = () => {
    setLastEncouragementTrigger(Date.now());
    triggerEncouragement();
  };

  const wrappedTriggerQuestion = () => {
    setLastQuestionTrigger(Date.now());
    triggerQuestion();
  };

  // Separate microadaptation logic
  useEffect(() => {
    if (emotionCheckIntervalRef.current) {
      clearInterval(emotionCheckIntervalRef.current);
    }

    emotionCheckIntervalRef.current = setInterval(() => {
      if (!videoStartTimeRef.current || !persistentEmotionRef.current || !emotionStartTimeRef.current) return;

      const currentTime = Date.now();
      const videoElapsedTime = currentTime - videoStartTimeRef.current;
      const emotionDuration = currentTime - emotionStartTimeRef.current;
      const oneMinute = 60 * 1000;
      const reactionCooldown = 30 * 1000;

      if (videoElapsedTime < oneMinute) return;

      // Map the persistent emotion to learning state
      const learningState = mapEmotionToLearningState(persistentEmotionRef.current);

      // --- Adaptation logic based on learning state ---
      if (learningState === 'engagement') {
        // Encourage after 3s of engagement
        if (emotionDuration >= 3 * 1000 && (currentTime - lastEncouragementTrigger) >= reactionCooldown) {
          wrappedTriggerEncouragement();
          setLastEmotionReactionTime(currentTime);
          emotionStartTimeRef.current = null;
          persistentEmotionRef.current = '';
          setPersistentEmotion('');
          setEmotionStartTime(null);
        }
      } else if (learningState === 'disengagement') {
        // Ask a question after 5s of disengagement
        if (emotionDuration >= 5 * 1000 && (currentTime - lastQuestionTrigger) >= reactionCooldown) {
          wrappedTriggerQuestion();
          setLastEmotionReactionTime(currentTime);
          emotionStartTimeRef.current = null;
          persistentEmotionRef.current = '';
          setPersistentEmotion('');
          setEmotionStartTime(null);
        }
      } else if (learningState === 'confusion') {
        // Slow playback after 7s of confusion
        if (emotionDuration >= 7 * 1000 && (currentTime - lastSlowPlaybackTrigger) >= reactionCooldown) {
          wrappedTriggerSlowPlayback();
          setLastEmotionReactionTime(currentTime);
          emotionStartTimeRef.current = null;
          persistentEmotionRef.current = '';
          setPersistentEmotion('');
          setEmotionStartTime(null);
        }
      } else if (learningState === 'frustration') {
        // Pause and reflect after 10s of frustration
        if (emotionDuration >= 10 * 1000 && (currentTime - lastPauseReflectTrigger) >= reactionCooldown) {
          wrappedTriggerPauseReflect();
          setLastEmotionReactionTime(currentTime);
          emotionStartTimeRef.current = null;
          persistentEmotionRef.current = '';
          setPersistentEmotion('');
          setEmotionStartTime(null);
        }
      }
    }, 1000);

    return () => {
      if (emotionCheckIntervalRef.current) {
        clearInterval(emotionCheckIntervalRef.current);
      }
    };
  }, [
    triggerEncouragement,
    triggerPauseReflect,
    triggerQuestion,
    triggerSlowPlayback,
    lastEncouragementTrigger,
    lastPauseReflectTrigger,
    lastQuestionTrigger,
    lastSlowPlaybackTrigger
  ]);

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (emotionCheckIntervalRef.current) {
        clearInterval(emotionCheckIntervalRef.current);
      }
      if (durationUpdateIntervalRef.current) {
        clearInterval(durationUpdateIntervalRef.current);
      }
      if (cooldownUpdateIntervalRef.current) {
        clearInterval(cooldownUpdateIntervalRef.current);
      }
    };
  }, []);

  // Map dominantEmotion to learning state
  const learningState = mapEmotionToLearningState(dominantEmotion);

  // You can use learningState in your UI, logs, or logic
  useEffect(() => {
    if (learningState !== 'unknown') {
      console.log('Learning State:', learningState);
    }
  }, [learningState]);

  return (
    <>
      {/* Debug Panel Toggle - Top Right */}
      <div className="debug-toggle">
        <span>Admin Panel</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showDebugPanel}
            onChange={(e) => setShowDebugPanel(e.target.checked)}
            className="toggle-input"
          />
          <span className="toggle-slider">
            <span className="toggle-knob" />
          </span>
        </label>
      </div>

      {/* Left Panel: Webcam */}
      <div className="left-panel">
        <div className="user-video-wrapper-container">
          <div className="user-video-wrapper maximized">
            <div className="webcam-container">
              <div className="user-video">
                <WebcamBox onAnalysisUpdate={setWebcamAnalysis} />
              </div>
            </div>
          </div>
        </div>
        
        <MessageBox messages={messageList} onClearMessages={clearMessages} />
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
          triggerRewind={wrappedTriggerRewind}
        />
      )}
      
      {/* Debug Panel for Testing Microadaptations */}
      {showDebugPanel && (
        <DebugPanel
          triggerRewind={wrappedTriggerRewind}
          triggerPauseReflect={wrappedTriggerPauseReflect}
          triggerSlowPlayback={wrappedTriggerSlowPlayback}
          triggerSummary={wrappedTriggerSummary}
          triggerEncouragement={wrappedTriggerEncouragement}
          triggerQuestion={wrappedTriggerQuestion}
          dominantEmotion={dominantEmotion}
          emotionDuration={emotionDuration}
          isConnected={webcamAnalysis.isConnected}
          hasDetectedFace={webcamAnalysis.hasDetectedFace}
          emotions={webcamAnalysis.emotions}
          testConnection={webcamAnalysis.testConnection}
          rewindCooldown={rewindCooldown}
          pauseReflectCooldown={pauseReflectCooldown}
          slowPlaybackCooldown={slowPlaybackCooldown}
          summaryCooldown={summaryCooldown}
          encouragementCooldown={encouragementCooldown}
          questionCooldown={questionCooldown}
          learningState={learningState} // <-- add this line
        />
      )}
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