import React, { useState, useRef, useEffect } from 'react';
import WebcamBox from './WebcamBox';
import MessageBox from './MessageBox';
import LearningVideo from './LearningVideo';
import DebugPanel from './DebugPanel';
import FaceDetectionOverlay from './FaceDetectionOverlay';
import { useRewind } from '../microadaptations/RewindHandler';
import { usePauseReflect } from '../microadaptations/PauseReflectHandler';
import { useQuestion } from '../microadaptations/QuestionHandler';
import { useSummary } from '../microadaptations/SummaryHandler';
import { useSlowPlayback } from '../microadaptations/SlowPlaybackHandler';
import { mapEmotionToLearningState } from '../utils/emotionMapping';
import { logAdaptationEvent } from '../utils/adaptationLogger';
import { findCurrentCheckpoint } from '../utils/checkpointUtils';


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
  // --- MOVE THESE TO THE VERY TOP ---
  const [rewindEnabled, setRewindEnabled] = useState(true);
  const [pauseReflectEnabled, setPauseReflectEnabled] = useState(true);
  const [slowPlaybackEnabled, setSlowPlaybackEnabled] = useState(true);
  const [summaryEnabled, setSummaryEnabled] = useState(true);
  const [encouragementEnabled, setEncouragementEnabled] = useState(true);
  const [questionEnabled, setQuestionEnabled] = useState(true);
  // --- END MOVED BLOCK ---
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
  const [globalCooldown, setGlobalCooldown] = useState<number>(0);
  const [lastRewindTrigger, setLastRewindTrigger] = useState<number>(0);
  const [lastPauseReflectTrigger, setLastPauseReflectTrigger] = useState<number>(0);
  const [lastSlowPlaybackTrigger, setLastSlowPlaybackTrigger] = useState<number>(0);
  const [lastSummaryTrigger, setLastSummaryTrigger] = useState<number>(0);
  const [lastEncouragementTrigger, setLastEncouragementTrigger] = useState<number>(0);
  const [lastQuestionTrigger, setLastQuestionTrigger] = useState<number>(0);
  const [lastGlobalAdaptationTrigger, setLastGlobalAdaptationTrigger] = useState<number>(0);
  // Move this to the top, before GLOBAL_COOLDOWN is used
  const [firstGlobalCooldown, setFirstGlobalCooldown] = useState(true);
  const INITIAL_GLOBAL_COOLDOWN = 90 * 1000; // 1.5 minutes
  const REGULAR_GLOBAL_COOLDOWN = 48 * 1000; // 48 seconds
  const GLOBAL_COOLDOWN = 48 * 1000; // 48 seconds
  const REWIND_COOLDOWN = 120 * 1000; // 2 minutes
  const PAUSE_REFLECT_COOLDOWN = 120 * 1000; // 2 minutes
  const SLOW_PLAYBACK_COOLDOWN = 120 * 1000; // 2 minutes
  const INDIVIDUAL_COOLDOWN = 40 * 1000; // 40 seconds (for other adaptations)
  const emotionCheckIntervalRef = useRef<number | null>(null);
  const durationUpdateIntervalRef = useRef<number | null>(null);
  const cooldownUpdateIntervalRef = useRef<number | null>(null);
  const emotionStartTimeRef = useRef<number | null>(null);
  const videoStartTimeRef = useRef<number | null>(null);
  const persistentEmotionRef = useRef<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Add counters for limiting adaptations
  const [pauseReflectCount, setPauseReflectCount] = useState<number>(0);
  const [slowPlaybackCount, setSlowPlaybackCount] = useState<number>(0);
  const [rewindCount, setRewindCount] = useState<number>(0);
  const [summaryCount, setSummaryCount] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [encouragementCount, setEncouragementCount] = useState<number>(0);
  const MAX_PAUSE_REFLECT_COUNT = 2;
  const MAX_SLOW_PLAYBACK_COUNT = 2;
  const MAX_REWIND_COUNT = 2;
  const MAX_SUMMARY_COUNT = 2;
  const MAX_QUESTION_COUNT = 2;
  const MAX_ENCOURAGEMENT_COUNT = 5;

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
      // Start the initial global cooldown when learning begins
      setLastGlobalAdaptationTrigger(startTime);
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

      setRewindCooldown(Math.max(0, REWIND_COOLDOWN - (currentTime - lastRewindTrigger)));
      setPauseReflectCooldown(Math.max(0, PAUSE_REFLECT_COOLDOWN - (currentTime - lastPauseReflectTrigger)));
      setSlowPlaybackCooldown(Math.max(0, SLOW_PLAYBACK_COOLDOWN - (currentTime - lastSlowPlaybackTrigger)));
      setSummaryCooldown(Math.max(0, INDIVIDUAL_COOLDOWN - (currentTime - lastSummaryTrigger)));
      setEncouragementCooldown(Math.max(0, INDIVIDUAL_COOLDOWN - (currentTime - lastEncouragementTrigger)));
      setQuestionCooldown(Math.max(0, INDIVIDUAL_COOLDOWN - (currentTime - lastQuestionTrigger)));
      setGlobalCooldown(Math.max(0, GLOBAL_COOLDOWN - (currentTime - lastGlobalAdaptationTrigger)));
    }, 100);

    return () => {
      if (cooldownUpdateIntervalRef.current) {
        clearInterval(cooldownUpdateIntervalRef.current);
      }
    };
  }, [
    lastRewindTrigger,
    lastPauseReflectTrigger,
    lastSlowPlaybackTrigger,
    lastSummaryTrigger,
    lastEncouragementTrigger,
    lastQuestionTrigger,
    lastGlobalAdaptationTrigger
  ]);

  // Wrap adaptation triggers to track timing
  const wrappedTriggerRewind = () => {
    setLastRewindTrigger(Date.now());
    setRewindCount(prev => prev + 1);
    triggerRewind();
  };

  const wrappedTriggerPauseReflect = () => {
    setLastPauseReflectTrigger(Date.now());
    setPauseReflectCount(prev => prev + 1);
    triggerPauseReflect();
  };

  const wrappedTriggerSlowPlayback = () => {
    setLastSlowPlaybackTrigger(Date.now());
    setSlowPlaybackCount(prev => prev + 1);
    triggerSlowPlayback();
  };

  const wrappedTriggerSummary = () => {
    setLastSummaryTrigger(Date.now());
    setSummaryCount(prev => prev + 1);
    triggerSummary();
  };

  const wrappedTriggerEncouragement = () => {
    setLastEncouragementTrigger(Date.now());
    setEncouragementCount(prev => prev + 1);
    triggerEncouragement();
  };

  const wrappedTriggerQuestion = () => {
    setLastQuestionTrigger(Date.now());
    setQuestionCount(prev => prev + 1);
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
      const emotionDuration = currentTime - emotionStartTimeRef.current;
      const reactionCooldown = 30 * 1000;

      // Map the persistent emotion to learning state
      const learningState = mapEmotionToLearningState(persistentEmotionRef.current);

      const globalCooldownActive = (currentTime - lastGlobalAdaptationTrigger) < GLOBAL_COOLDOWN;
      if (globalCooldownActive) return;

      // --- Adaptation logic based on your table ---
      // Rewind: Confusion
      if (
        !globalCooldownActive &&
        rewindEnabled &&
        rewindCount < MAX_REWIND_COUNT &&
        learningState === 'confusion' &&
        emotionDuration >= 8 * 1000 &&
        (currentTime - lastRewindTrigger) >= reactionCooldown
      ) {
        const videoCurrentTime = videoRef.current?.currentTime || 0;
        const checkpoint = findCurrentCheckpoint(videoCurrentTime);
        
        setAdaptationMessage(`Rewind triggered by ${learningState}`);
        setLastGlobalAdaptationTrigger(currentTime);
        if (firstGlobalCooldown) setFirstGlobalCooldown(false);
        
        // Log the adaptation event
        logAdaptationEvent(
          'Rewind',
          videoCurrentTime,
          checkpoint.title,
          persistentEmotionRef.current,
          learningState,
          rewindCount + 1,
          2,
          `Triggered by ${learningState} emotion`
        );
        
        wrappedTriggerRewind();
        setLastEmotionReactionTime(currentTime);
        emotionStartTimeRef.current = null;
        persistentEmotionRef.current = '';
        setPersistentEmotion('');
        setEmotionStartTime(null);
        return;
      }

      // Pause/Reflect: Sadness
      if (
        !globalCooldownActive &&
        pauseReflectEnabled &&
        pauseReflectCount < MAX_PAUSE_REFLECT_COUNT &&
        learningState === 'confusion' &&
        emotionDuration >= 8 * 1000 &&
        (currentTime - lastPauseReflectTrigger) >= reactionCooldown
      ) {
        const videoCurrentTime = videoRef.current?.currentTime || 0;
        const checkpoint = findCurrentCheckpoint(videoCurrentTime);
        
        setAdaptationMessage(`Pause/Reflect triggered by ${learningState}`);
        setLastGlobalAdaptationTrigger(currentTime);
        if (firstGlobalCooldown) setFirstGlobalCooldown(false);
        
        // Log the adaptation event
        logAdaptationEvent(
          'PauseReflect',
          videoCurrentTime,
          checkpoint.title,
          persistentEmotionRef.current,
          learningState,
          pauseReflectCount + 1,
          2,
          `Triggered by ${learningState} emotion`
        );
        
        wrappedTriggerPauseReflect();
        setLastEmotionReactionTime(currentTime);
        emotionStartTimeRef.current = null;
        persistentEmotionRef.current = '';
        setPersistentEmotion('');
        setEmotionStartTime(null);
        return;
      }

      // Slow Playback: Confusion
      if (
        !globalCooldownActive &&
        slowPlaybackEnabled &&
        slowPlaybackCount < MAX_SLOW_PLAYBACK_COUNT &&
        learningState === 'confusion' &&
        emotionDuration >= 7 * 1000 &&
        (currentTime - lastSlowPlaybackTrigger) >= SLOW_PLAYBACK_COOLDOWN
      ) {
        const videoCurrentTime = videoRef.current?.currentTime || 0;
        const checkpoint = findCurrentCheckpoint(videoCurrentTime);
        
        setAdaptationMessage(`Slow Playback triggered by ${learningState}`);
        setLastGlobalAdaptationTrigger(currentTime);
        if (firstGlobalCooldown) setFirstGlobalCooldown(false);
        
        // Log the adaptation event
        logAdaptationEvent(
          'Slow Playback',
          videoCurrentTime,
          checkpoint.title,
          persistentEmotionRef.current,
          learningState,
          slowPlaybackCount + 1,
          2,
          `Triggered by ${learningState} emotion`
        );
        
        wrappedTriggerSlowPlayback();
        setLastEmotionReactionTime(currentTime);
        emotionStartTimeRef.current = null;
        persistentEmotionRef.current = '';
        setPersistentEmotion('');
        setEmotionStartTime(null);
        return;
      }

      // Summary: Confusion, Disengagement
      if (
        !globalCooldownActive &&
        summaryEnabled && // <-- ADD THIS CHECK
        summaryCount < MAX_SUMMARY_COUNT &&
        (learningState === 'confusion' || learningState === 'disengagement') &&
        emotionDuration >= 8 * 1000 &&
        (currentTime - lastSummaryTrigger) >= reactionCooldown
      ) {
        const videoCurrentTime = videoRef.current?.currentTime || 0;
        const checkpoint = findCurrentCheckpoint(videoCurrentTime);
        
        setAdaptationMessage(`Summary triggered by ${learningState}`);
        setLastGlobalAdaptationTrigger(currentTime);
        if (firstGlobalCooldown) setFirstGlobalCooldown(false);
        
        // Log the adaptation event
        logAdaptationEvent(
          'Summary',
          videoCurrentTime,
          checkpoint.title,
          persistentEmotionRef.current,
          learningState,
          summaryCount + 1,
          2,
          `Triggered by ${learningState} emotion`
        );
        
        wrappedTriggerSummary();
        setLastEmotionReactionTime(currentTime);
        emotionStartTimeRef.current = null;
        persistentEmotionRef.current = '';
        setPersistentEmotion('');
        setEmotionStartTime(null);
        return;
      }

      // Encourage: Frustration, Disengagement
      if (
        !globalCooldownActive &&
        encouragementEnabled && // <-- ADD THIS CHECK
        encouragementCount < MAX_ENCOURAGEMENT_COUNT &&
        (learningState === 'frustration' || learningState === 'disengagement') &&
        emotionDuration >= 5 * 1000 &&
        (currentTime - lastEncouragementTrigger) >= reactionCooldown
      ) {
        const videoCurrentTime = videoRef.current?.currentTime || 0;
        const checkpoint = findCurrentCheckpoint(videoCurrentTime);
        
        setAdaptationMessage(`Encourage triggered by ${learningState}`);
        setLastGlobalAdaptationTrigger(currentTime);
        if (firstGlobalCooldown) setFirstGlobalCooldown(false);
        
        // Log the adaptation event
        logAdaptationEvent(
          'Encouragement',
          videoCurrentTime,
          checkpoint.title,
          persistentEmotionRef.current,
          learningState,
          encouragementCount + 1,
          5,
          `Triggered by ${learningState} emotion`
        );
        
        wrappedTriggerEncouragement();
        setLastEmotionReactionTime(currentTime);
        emotionStartTimeRef.current = null;
        persistentEmotionRef.current = '';
        setPersistentEmotion('');
        setEmotionStartTime(null);
        return;
      }

      // Question: Engagement or Disengagement
      if (
        !globalCooldownActive &&
        questionEnabled && // <-- ADD THIS CHECK
        questionCount < MAX_QUESTION_COUNT &&
        (learningState === 'engagement' || learningState === 'disengagement') &&
        (currentTime - lastQuestionTrigger) >= reactionCooldown
      ) {
        const videoCurrentTime = videoRef.current?.currentTime || 0;
        const checkpoint = findCurrentCheckpoint(videoCurrentTime);
        
        setAdaptationMessage(`Question triggered by ${learningState}`);
        setLastGlobalAdaptationTrigger(currentTime);
        if (firstGlobalCooldown) setFirstGlobalCooldown(false);
        
        // Log the adaptation event
        logAdaptationEvent(
          'Question',
          videoCurrentTime,
          checkpoint.title,
          persistentEmotionRef.current,
          learningState,
          questionCount + 1,
          2,
          `Triggered by ${learningState} emotion`
        );
        
        wrappedTriggerQuestion();
        setLastEmotionReactionTime(currentTime);
        emotionStartTimeRef.current = null;
        persistentEmotionRef.current = '';
        setPersistentEmotion('');
        setEmotionStartTime(null);
        return;
      }

    }, 1000);

    return () => {
      if (emotionCheckIntervalRef.current) {
        clearInterval(emotionCheckIntervalRef.current);
      }
    };
  }, [
    triggerRewind,
    triggerPauseReflect,
    triggerQuestion,
    triggerSummary,
    triggerSlowPlayback,
    triggerEncouragement,
    lastRewindTrigger,
    lastPauseReflectTrigger,
    lastQuestionTrigger,
    lastSummaryTrigger,
    lastSlowPlaybackTrigger,
    lastEncouragementTrigger,
    lastGlobalAdaptationTrigger,
    firstGlobalCooldown,
    rewindEnabled,
    pauseReflectEnabled,
    slowPlaybackEnabled,
    summaryEnabled,
    encouragementEnabled,
    questionEnabled
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

  const [adaptationMessage, setAdaptationMessage] = useState<string>('');

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
            videoRef={videoRef}
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
          adaptationMessage={adaptationMessage}
          globalCooldown={globalCooldown}
          rewindEnabled={rewindEnabled}
          setRewindEnabled={setRewindEnabled}
          pauseReflectEnabled={pauseReflectEnabled}
          setPauseReflectEnabled={setPauseReflectEnabled}
          slowPlaybackEnabled={slowPlaybackEnabled}
          setSlowPlaybackEnabled={setSlowPlaybackEnabled}
          summaryEnabled={summaryEnabled}
          setSummaryEnabled={setSummaryEnabled}
          encouragementEnabled={encouragementEnabled}
          setEncouragementEnabled={setEncouragementEnabled}
          questionEnabled={questionEnabled}
          setQuestionEnabled={setQuestionEnabled}
          pauseReflectCount={pauseReflectCount}
          slowPlaybackCount={slowPlaybackCount}
          rewindCount={rewindCount}
          summaryCount={summaryCount}
          questionCount={questionCount}
          encouragementCount={encouragementCount}
          videoRef={videoRef}
        />
      )}
    </>
  );
};

export default LearningContent;