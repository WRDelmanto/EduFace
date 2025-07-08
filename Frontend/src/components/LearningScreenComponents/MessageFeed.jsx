import MessageBubble from './MessageBubble';

function MessageFeed({ minimized }) {
  return (
    <div className="text-feed-container">
      <div className={`text-feed ${minimized ? 'grow' : ''}`}>
        <MessageBubble text="Welcome to your personalized learning session." />
        <MessageBubble text="We'll guide you through adaptive content based on your focus and mood." />
        <MessageBubble text="Please ensure your face is clearly visible to the camera." />
      </div>
    </div>
  );
}

export default MessageFeed;