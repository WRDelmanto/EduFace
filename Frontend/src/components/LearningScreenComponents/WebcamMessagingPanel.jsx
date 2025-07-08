import WebcamDisplay from './WebcamDisplay';
import MessageFeed from './MessageFeed';

function WebcamMessagingPanel({ videoRef, minimized, toggleMinimized }) {
  return (
    <div className="left-panel">
      <WebcamDisplay videoRef={videoRef} minimized={minimized} toggleMinimized={toggleMinimized} />
      <MessageFeed minimized={minimized} />
    </div>
  );
}

export default WebcamMessagingPanel;