import WebcamDisplay from './WebcamDisplay';
import MessageFeed from './MessageFeed';

function WebcamMessagingPanel({ videoRef, minimized, toggleMinimized, messages, onResponse, mostRecentMessageId }) {
  return (
    <div className="left-panel">
      <WebcamDisplay videoRef={videoRef} minimized={minimized} toggleMinimized={toggleMinimized} />
        <MessageFeed
          minimized={minimized}
          messages={messages}
          onResponse={onResponse}
          mostRecentMessageId={mostRecentMessageId}
        />
    </div>
  );
}

export default WebcamMessagingPanel;