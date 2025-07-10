import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

function MessageFeed({ minimized, messages = [], onResponse, mostRecentMessageId }) {
  const reversedMessages = [...messages].slice().reverse();
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="text-feed-container">
      <div
        className={`text-feed ${minimized ? 'grow' : ''}`}
        ref={feedRef}
        style={{ overflowY: 'auto', maxHeight: '100%', paddingBottom: '30%' }}
      >
        {[...messages].slice().reverse().map((msg) => {
          if (!msg.id) console.warn("Message is missing an ID:", msg);
          const isMostRecent = msg.id === mostRecentMessageId;
          return (
            <div key={msg.id} className={isMostRecent ? '' : 'faded'}>
              <MessageBubble
                {...msg}
                onResponse={onResponse}
                animate={isMostRecent}
                mostRecentMessageId={mostRecentMessageId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MessageFeed;