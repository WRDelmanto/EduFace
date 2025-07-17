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
          {emotions && (
            <div>
              <h5>Detailed Emotions:</h5>
              <div className="emotions-grid">
                {Object.entries(emotions).map(([emotion, confidence]) => {
                  const percentage = typeof confidence === 'number' 
                    ? confidence > 1 
                      ? confidence.toFixed(1)
                      : (confidence * 100).toFixed(1)
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
          <h4>Current Emotion:</h4>
          <div className="emotion-value">
            {dominantEmotion ? 
              `${dominantEmotion} (${formatDuration(emotionDuration)})` : 
              'No emotion detected'
            }
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
       