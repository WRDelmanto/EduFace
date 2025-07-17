import React, { useEffect, useRef } from 'react';
import '../styles/LearningPage.css';
import popSound from '../assets/pop.mp3';

interface Message {
  id: number;
  text: string;
  type: 'system' | 'user' | 'encouragement' | 'rewind' | 'question';
  timestamp: Date;
}

interface MessageBoxProps {
  messages: Message[];
  onClearMessages?: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ messages, onClearMessages }) => {
  const messageEndRef = useRef<HTMLDivElement>(null);

  const playNotificationSound = () => {
    try {
      const audio = new Audio(popSound);
      audio.volume = 0.9;
      audio.play();
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      playNotificationSound();
    }
  }, [messages.length]);

  // Reverse messages to show newest first
  const reversedMessages = [...messages].reverse();

  return (
    <div className="message-feed">
      {/* Clear Messages Button */}
      {messages.length > 0 && onClearMessages && (
        <button 
          className="clear-messages-btn"
          onClick={onClearMessages}
          title="Clear all messages"
        >
          ✕
        </button>
      )}
      
      {reversedMessages.length === 0 ? (
        <div className="message-bubble system">
          Welcome! Messages will appear here.
        </div>
      ) : (
        reversedMessages.map((message) => (
          <div 
            key={message.id} 
            className={`message-bubble ${message.type} animate-pop-in`}
          >
            {message.text}
          </div>
        ))
      )}
      <div ref={messageEndRef} />
    </div>
  );
};

export default MessageBox;