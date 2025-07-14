import React, { createContext, useContext, useRef, useState } from 'react';

interface Checkpoint {
  time: number;
  title: string;
}

interface RewindContextType {
  triggerRewind: () => void;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  setMessageCallback: (callback: (message: string) => void) => void;
  isRewinding: boolean;
  currentCheckpoint: Checkpoint | null;
}

const RewindContext = createContext<RewindContextType | undefined>(undefined);

export const useRewind = () => {
  const context = useContext(RewindContext);
  if (!context) {
    throw new Error('useRewind must be used within a RewindHandler');
  }
  return context;
};

interface RewindHandlerProps {
  children: React.ReactNode;
}

const RewindHandler: React.FC<RewindHandlerProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRewinding, setIsRewinding] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const messageCallbackRef = useRef<((message: string) => void) | null>(null);

  // Video timestamps in seconds
  const checkpoints = [
    { time: 0, title: "Introduction to bacteriophages" },
    { time: 48, title: "Phages outnumber all organisms" },
    { time: 85, title: "How phages infect bacteria" },
    { time: 117, title: "Phage replication and bacterial death" },
    { time: 154, title: "Humans discover antibiotics" },
    { time: 187, title: "Antibiotic overuse and resistance" },
    { time: 222, title: "Rise of superbugs and threat" },
    { time: 254, title: "Phages as targeted antibacterial agents" },
    { time: 288, title: "Phage-bacteria evolutionary arms race" },
    { time: 325, title: "Phage therapy successes" },
    { time: 356, title: "Experimental status and clinical trials" }
  ];

  const setVideoRef = (ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  };

  const setMessageCallback = (callback: (message: string) => void) => {
    messageCallbackRef.current = callback;
  };

  const findPreviousCheckpoint = (currentTime: number) => {
    // Find the closest checkpoint before the current time
    let previousCheckpoint = checkpoints[0];
    
    for (let i = 0; i < checkpoints.length; i++) {
      if (checkpoints[i].time < currentTime) {
        previousCheckpoint = checkpoints[i];
      } else {
        break;
      }
    }
    
    return previousCheckpoint;
  };

  const triggerRewind = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const previousCheckpoint = findPreviousCheckpoint(currentTime);
      
      // Set the checkpoint info and show overlay
      setCurrentCheckpoint(previousCheckpoint);
      setIsRewinding(true);
      
      // Perform the rewind
      videoRef.current.currentTime = previousCheckpoint.time;
      
      // Send message to message box
      if (messageCallbackRef.current) {
        messageCallbackRef.current(`📍 Rewound to: "${previousCheckpoint.title}"`);
      }
      
      // Hide overlay after 2 seconds
      setTimeout(() => {
        setIsRewinding(false);
        setCurrentCheckpoint(null);
      }, 2000);
      
      console.log(`Rewound to checkpoint: "${previousCheckpoint.title}" at ${previousCheckpoint.time}s`);
    } else {
      console.log('Video reference not available');
    }
  };

  return (
    <RewindContext.Provider value={{ 
      triggerRewind, 
      setVideoRef, 
      setMessageCallback,
      isRewinding, 
      currentCheckpoint 
    }}>
      {children}
    </RewindContext.Provider>
  );
};

export default RewindHandler;