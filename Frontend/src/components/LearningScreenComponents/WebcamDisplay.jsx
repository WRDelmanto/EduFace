function WebcamDisplay({ videoRef, minimized, toggleMinimized }) {
  return (
    <div className="user-video-wrapper-container">
      <div className={`user-video-wrapper ${minimized ? 'minimized' : 'maximized'}`}>
        <div className="webcam-container">
          <div className="user-video">
            <video className="webcam-feed" ref={videoRef} autoPlay muted />
          </div>
        </div>
      </div>

      <button className="minimize-button" onClick={toggleMinimized}>
        {minimized ? 'Show Webcam' : 'Hide Webcam'}
      </button>
    </div>
  );
}

export default WebcamDisplay;