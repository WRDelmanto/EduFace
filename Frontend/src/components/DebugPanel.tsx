import React, { useEffect, useState } from 'react';
import '../styles/DebugPanel.css';
import { logAdaptationMessage, downloadAdaptationLogs, startLogging, stopLogging, isLogging } from '../utils/adaptationLogger';

interface DebugPanelProps {
  triggerRewind: () => void;
  triggerPauseReflect: () => void;
  triggerSlowPlayback: () => void;
  triggerSummary: () => void;
  triggerEncouragement: () => void;
  triggerQuestion: () => void;
  dominantEmotion: string;
  emotionDuration: number;
  isConnected?: boolean;
  hasDetectedFace?: boolean;
  emotions?: any;
  testConnection?: () => void;
  rewindCooldown?: number;
  pauseReflectCooldown?: number;
  slowPlaybackCooldown?: number;
  summaryCooldown?: number;
  encouragementCooldown?: number;
  questionCooldown?: number;
  learningState?: string; // <-- add this
  adaptationMessage?: string;
  globalCooldown?: number;
  rewindEnabled: boolean;
  setRewindEnabled: (enabled: boolean) => void;
  pauseReflectEnabled: boolean;
  setPauseReflectEnabled: (enabled: boolean) => void;
  slowPlaybackEnabled: boolean;
  setSlowPlaybackEnabled: (enabled: boolean) => void;
  summaryEnabled: boolean;
  setSummaryEnabled: (enabled: boolean) => void;
  encouragementEnabled: boolean;
  setEncouragementEnabled: (enabled: boolean) => void;
  questionEnabled: boolean;
  setQuestionEnabled: (enabled: boolean) => void;
  pauseReflectCount?: number;
  slowPlaybackCount?: number;
  rewindCount?: number;
  summaryCount?: number;
  questionCount?: number;
  encouragementCount?: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  triggerRewind,
  triggerPauseReflect,
  triggerSlowPlayback,
  triggerSummary,
  triggerEncouragement,
  triggerQuestion,
  dominantEmotion,
  emotionDuration,
  isConnected = false,
  hasDetectedFace = false,
  emotions = null,
  testConnection,
  rewindCooldown = 0,
  pauseReflectCooldown = 0,
  slowPlaybackCooldown = 0,
  summaryCooldown = 0,
  encouragementCooldown = 0,
  questionCooldown = 0,
  learningState = 'unknown', // <-- add this
  adaptationMessage = '',
  globalCooldown = 0,
  rewindEnabled,
  setRewindEnabled,
  pauseReflectEnabled,
  setPauseReflectEnabled,
  slowPlaybackEnabled,
  setSlowPlaybackEnabled,
  summaryEnabled,
  setSummaryEnabled,
  encouragementEnabled,
  setEncouragementEnabled,
  questionEnabled,
  setQuestionEnabled,
  pauseReflectCount = 0,
  slowPlaybackCount = 0,
  rewindCount = 0,
  summaryCount = 0,
  questionCount = 0,
  encouragementCount = 0,
  videoRef,
}) => {
  const [loggingActive, setLoggingActive] = useState(isLogging());
  const [timerTick, setTimerTick] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (videoRef?.current && !videoRef.current.paused) {
      interval = setInterval(() => {
        setTimerTick(t => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoRef, videoRef?.current?.paused]);

  // Format duration for display
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  useEffect(() => {
    if (adaptationMessage) {
      logAdaptationMessage(adaptationMessage);
    }
  }, [adaptationMessage]);

  const currentTime = videoRef?.current?.currentTime || 0;

  // Remove the 2-minute lockout logic and use only the actual cooldowns
  const effectiveRewindCooldown = rewindCooldown;
  const effectivePauseReflectCooldown = pauseReflectCooldown;

  // Add a prop or state to indicate if it's the first global cooldown
  const isFirstGlobalCooldown = globalCooldown > 48000; // 1.5 min = 90000ms, 48s = 48000ms

  return (
    <div className="debug-panel">
      {/* Main content in horizontal layout */}
      <div className="debug-panel-content">
        
        {/* Webcam Analysis - Complete */}
        <div className="webcam-analysis">
          <h4>Webcam Analysis:</h4>
          <div className="webcam-status">
            <div>
              Connection Status: <strong className={isConnected ? 'status-connected' : 'status-disconnected'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </strong>
            </div>
            <div>
              Face Detected: <strong className={hasDetectedFace ? 'status-connected' : 'status-disconnected'}>
                {hasDetectedFace ? 'Yes' : 'No'}
              </strong>
            </div>
          </div>
          {emotions && Object.keys(emotions).length > 0 && (
            <div>
              <h5>Detailed Emotions:</h5>
              <div className="emotions-grid">
                {Object.entries(emotions).map(([emotion, confidence]) => {
                  const percentage = hasDetectedFace 
                    ? (typeof confidence === 'number' 
                        ? confidence > 1 
                          ? confidence.toFixed(1)
                          : (confidence * 100).toFixed(1)
                        : '0.0')
                    : '0.0';
                  
                  return (
                    <div key={emotion} className="emotion-item">
                      <div className="emotion-name">{emotion}:</div>
                      <div>{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Emotion - Complete */}
        <div className="emotion-display">
          <h4>Current Basic Emotion:</h4>
          <div className="emotion-value">
            {dominantEmotion && hasDetectedFace ? 
              `${dominantEmotion} (${formatDuration(emotionDuration)})` : 
              'No emotion detected'
            }
          </div>
          <h4 style={{ marginTop: 12 }}>Current Learner Emotion:</h4>
          <div className="emotion-value">
            {learningState && hasDetectedFace ? learningState : 'N/A'}
          </div>
        </div>

        {/* Adaptation Cooldowns */}
        <div className="emotion-cooldowns">
          <h4>Adaptation Cooldowns:</h4>
          <div className="cooldown-item">
            <span>Global:</span>
            <span className={globalCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {globalCooldown > 0 ? formatDuration(globalCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>
              <input
                type="checkbox"
                checked={rewindEnabled}
                onChange={e => setRewindEnabled(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Rewind
            </span>
            <span style={{ marginRight: '8px', fontSize: '12px', color: '#ff6b35', fontWeight: 'bold' }}>
              ({rewindCount}/2)
            </span>
            <span className={effectiveRewindCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {effectiveRewindCooldown > 0 ? formatDuration(effectiveRewindCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>
              <input
                type="checkbox"
                checked={pauseReflectEnabled}
                onChange={e => setPauseReflectEnabled(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Pause & Reflect
            </span>
            <span style={{ marginRight: '8px', fontSize: '12px', color: '#ff6b35', fontWeight: 'bold' }}>
              ({pauseReflectCount}/2)
            </span>
            <span className={effectivePauseReflectCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {effectivePauseReflectCooldown > 0 ? formatDuration(effectivePauseReflectCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>
              <input
                type="checkbox"
                checked={slowPlaybackEnabled}
                onChange={e => setSlowPlaybackEnabled(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Slow Playback
            </span>
            <span style={{ marginRight: '8px', fontSize: '12px', color: '#ff6b35', fontWeight: 'bold' }}>
              ({slowPlaybackCount}/1)
            </span>
            <span className={slowPlaybackCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {slowPlaybackCount >= 1
                ? 'Done'
                : (slowPlaybackCooldown > 0 ? formatDuration(slowPlaybackCooldown) : 'Ready')}
            </span>
          </div>
          <div className="cooldown-item">
            <span>
              <input
                type="checkbox"
                checked={summaryEnabled}
                onChange={e => setSummaryEnabled(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Summary
            </span>
            <span style={{ marginRight: '8px', fontSize: '12px', color: '#ff6b35', fontWeight: 'bold' }}>
              ({summaryCount}/2)
            </span>
            <span className={summaryCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {summaryCooldown > 0 ? formatDuration(summaryCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>
              <input
                type="checkbox"
                checked={encouragementEnabled}
                onChange={e => setEncouragementEnabled(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Encouragement
            </span>
            <span style={{ marginRight: '8px', fontSize: '12px', color: '#ff6b35', fontWeight: 'bold' }}>
              ({encouragementCount}/5)
            </span>
            <span className={encouragementCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {encouragementCooldown > 0 ? formatDuration(encouragementCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>
              <input
                type="checkbox"
                checked={questionEnabled}
                onChange={e => setQuestionEnabled(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Question
            </span>
            <span style={{ marginRight: '8px', fontSize: '12px', color: '#ff6b35', fontWeight: 'bold' }}>
              ({questionCount}/2)
            </span>
            <span className={questionCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {questionCooldown > 0 ? formatDuration(questionCooldown) : 'Ready'}
            </span>
          </div>
        </div>

        {/* Logging Controls */}
        <div className="logging-controls">
          <h4>Adaptation Logging:</h4>
          <div className="logging-buttons">
            <button 
              onClick={() => {
                startLogging();
                setLoggingActive(true);
              }} 
              className={`logging-button ${loggingActive ? 'disabled' : 'start'}`}
              disabled={loggingActive}
            >
              ▶️ Start Logging
            </button>
            <button 
              onClick={() => {
                stopLogging();
                setLoggingActive(false);
              }} 
              className={`logging-button ${loggingActive ? 'stop' : 'disabled'}`}
              disabled={!loggingActive}
            >
              ⏹️ Stop Logging
            </button>
          </div>
          <div className="logging-status">
            Status: <span className={loggingActive ? 'status-active' : 'status-inactive'}>
              {loggingActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="download-logs">
            <button onClick={downloadAdaptationLogs} className="download-button">
              📥 Download Adaptation Logs
            </button>
          </div>
        </div>

        {/* Test Connection Button */}
        {testConnection && (
          <div className="test-connection">
            <button onClick={testConnection} className="test-button">
              Test Connection (check console)
            </button>
          </div>
        )}
      </div>

      {/* Debug buttons in horizontal layout */}
      <div className="debug-buttons">
        <button onClick={triggerRewind} disabled={!rewindEnabled}>Rewind</button>
        <button onClick={triggerPauseReflect} disabled={!pauseReflectEnabled}>Pause & Reflect</button>
        <button onClick={triggerSlowPlayback} disabled={!slowPlaybackEnabled}>Slow Playback</button>
        <button onClick={triggerSummary} disabled={!summaryEnabled}>Summary</button>
        <button onClick={triggerEncouragement} disabled={!encouragementEnabled}>Encourage</button>
        <button onClick={triggerQuestion} disabled={!questionEnabled}>Question</button>
        {adaptationMessage && (
          <span className="adaptation-message" style={{ color: '#ffd700', fontWeight: 'bold', marginLeft: 'auto', alignSelf: 'center', display: 'inline-block' }}>
            {adaptationMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
