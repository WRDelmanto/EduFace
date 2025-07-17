import React from 'react';
import '../styles/DebugPanel.css';

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
}) => {
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
            <span>Rewind:</span>
            <span className={rewindCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {rewindCooldown > 0 ? formatDuration(rewindCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>Pause & Reflect:</span>
            <span className={pauseReflectCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {pauseReflectCooldown > 0 ? formatDuration(pauseReflectCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>Slow Playback:</span>
            <span className={slowPlaybackCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {slowPlaybackCooldown > 0 ? formatDuration(slowPlaybackCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>Summary:</span>
            <span className={summaryCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {summaryCooldown > 0 ? formatDuration(summaryCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>Encouragement:</span>
            <span className={encouragementCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {encouragementCooldown > 0 ? formatDuration(encouragementCooldown) : 'Ready'}
            </span>
          </div>
          <div className="cooldown-item">
            <span>Question:</span>
            <span className={questionCooldown > 0 ? 'cooldown-active' : 'cooldown-ready'}>
              {questionCooldown > 0 ? formatDuration(questionCooldown) : 'Ready'}
            </span>
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
        <button onClick={triggerRewind}>Rewind</button>
        <button onClick={triggerPauseReflect}>Pause & Reflect</button>
        <button onClick={triggerSlowPlayback}>Slow Playback</button>
        <button onClick={triggerSummary}>Summary</button>
        <button onClick={triggerEncouragement}>Encourage</button>
        <button onClick={triggerQuestion}>Question</button>
      </div>
    </div>
  );
};

export default DebugPanel;
