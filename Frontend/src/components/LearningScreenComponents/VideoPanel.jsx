import { useEffect, useState } from 'react';
import learningVideo from '../../assets/learningVideo.mp4';
import handleLearningState from '../../services/microadaptation';

function VideoPanel({
  videoStarted,
  onStart,
  latestResponse,
  onRewindRequest,
  videoRef,
  setMessages,
  onUserResponse,
  onResume // 👈 Add this
}) {
  const [pauseOverlay, setPauseOverlay] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (videoStarted && latestResponse?.learning_state) {
      handleLearningState(
        latestResponse.learning_state,
        videoRef,
        setMessages,
        onUserResponse,
        setPauseOverlay,
        setCountdown
      );
    }
  }, [latestResponse, videoStarted, onRewindRequest, setMessages, onUserResponse]);

  return (
    <div className="right-panel">
      {!videoStarted ? (
        <div className="pre-video-message">
          <h2>You're about to begin a learning session</h2>
          <p>Please try your best to watch the video attentively. This helps us improve personalized digital learning experiences.</p>
          <button className="start-video-button" onClick={onStart}>
            Start Video
          </button>
        </div>
      ) : (
        <div className="main-video" style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            src={learningVideo}
            controls
            autoPlay
            className="video-element"
            onPlay={() => {
              // This prop comes from LearningScreen
              if (typeof onResume === 'function') onResume();
            }}
          >
            Your browser does not support the video tag.
          </video>
          {pauseOverlay && (
            <div className="video-overlay">
              {countdown}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoPanel;