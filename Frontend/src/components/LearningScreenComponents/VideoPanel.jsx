import { useEffect, useRef } from 'react';
import learningVideo from '../../assets/learningVideo.mp4';
import handleLearningState from '../../services/microadaptation';

function VideoPanel({ videoStarted, onStart, latestResponse }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoStarted && latestResponse?.learning_state) {
      handleLearningState(latestResponse.learning_state, videoRef);
    }
  }, [latestResponse, videoStarted]);

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
        <div className="main-video">
          <video
            ref={videoRef}
            src={learningVideo}
            controls
            autoPlay
            className="video-element"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default VideoPanel;