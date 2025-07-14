import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  type: 'system' | 'user' | 'encouragement' | 'rewind' | 'question';
  timestamp: Date;
}

interface EncouragementHandlerProps {
  children: (data: { 
    messages: Message[]; 
    triggerEncouragement: () => void;
    addMessage: (text: string, type?: 'system' | 'user' | 'encouragement' | 'rewind' | 'question') => void;
  }) => React.ReactNode;
}

const EncouragementHandler: React.FC<EncouragementHandlerProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const encouragementMessages = [
    "You're doing great! Keep up the excellent work! 🌟",
    "Fantastic progress! You're really getting the hang of this! 💪",
    "Great job! Your dedication is paying off! 🎉",
    "Excellent work! You're making real progress! ✨",
    "Keep it up! You're doing amazing! 🚀"
  ];

  const addMessage = (text: string, type: 'system' | 'user' | 'encouragement' | 'rewind' | 'question' = 'system') => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      type,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const triggerEncouragement = () => {
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    addMessage(randomMessage, 'encouragement');
  };

  return <>{children({ messages, triggerEncouragement, addMessage })}</>;
};

export default EncouragementHandler;