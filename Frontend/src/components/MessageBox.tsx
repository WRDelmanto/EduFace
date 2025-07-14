import React, { useEffect, useRef } from 'react';
import '../styles/LearningPage.css';

interface Message {
  id: number;
  text: string;
  type: 'system' | 'user' | 'encouragement' | 'rewind' | 'question';
  timestamp: Date;
}

interface MessageBoxProps {
  messages: Message[];
}

const MessageBox: React.FC<MessageBoxProps> = ({ messages }) => {
  const messageEndRef = useRef<HTMLDivElement>(null);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/pop.mp3');
      audio.volume = 0.05;
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