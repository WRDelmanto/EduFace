import { useEffect, useState } from 'react';

// Global set to track which messages have already triggered the pop sound
const poppedMessages = new Set();

function MessageBubble({
  id,
  text,
  sender = 'system',
  align = 'left',
  type = 'info',
  options,
  onResponse,
  animate,
  mostRecentMessageId,
}) {
  const [hasResponded, setHasResponded] = useState(false);
  const [triggerAnim, setTriggerAnim] = useState(false);
  const isMostRecent = id === mostRecentMessageId;

  useEffect(() => {
    if (animate && isMostRecent && !poppedMessages.has(id)) {
      const popSound = new Audio('/src/assets/pop.mp3');
      popSound.play();

      setTriggerAnim(true);
      poppedMessages.add(id); // prevent replays

      const timer = setTimeout(() => setTriggerAnim(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animate, isMostRecent, id]);

  const handleClick = (value) => {
    if (!hasResponded && isMostRecent) {
      setHasResponded(true);
      onResponse(value, id);
    }
  };

  return (
      <div
        className={`message-bubble ${sender} ${align} ${type} ${
          hasResponded ? 'disabled' : ''
        } ${!isMostRecent ? 'faded' : ''} ${triggerAnim ? 'animate-pop-in' : ''}`}
      >
      <p>{text}</p>
      {options && options.length > 0 && (
        <div className="response-buttons">
          {options.map((option, idx) => (
            <button
              key={option.value}
              onClick={() => handleClick(option.value)}
              disabled={hasResponded || !isMostRecent}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;