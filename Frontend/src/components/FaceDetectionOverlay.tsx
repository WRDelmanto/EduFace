
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
}
export default FaceDetectionOverlay;