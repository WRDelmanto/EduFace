import React, { createContext, useContext, useRef, useState } from 'react';

interface Checkpoint {
  time: number;
  title: string;
}

interface PauseReflectContextType {
  triggerPauseReflect: () => void;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  isPaused: boolean;
  timeLeft: number;
  currentCheckpoint: Checkpoint | null;
}

const PauseReflectContext = createContext<PauseReflectContextType | undefined>(undefined);

export const usePauseReflect = () => {
  const context = useContext(PauseReflectContext);
  if (!context) {
    throw new Error('usePauseReflect must be used within a PauseReflectHandler');
  }
  return context;
};

interface PauseReflectHandlerProps {
  children: React.ReactNode;
}

const PauseReflectHandler: React.FC<PauseReflectHandlerProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);

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

  const findPreviousCheckpoint = (currentTime: number) => {
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

  const triggerPauseReflect = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const previousCheckpoint = findPreviousCheckpoint(currentTime);
      
      // Pause the video
      videoRef.current.pause();
      
      // Set up pause state
      setCurrentCheckpoint(previousCheckpoint);
      setIsPaused(true);
      setTimeLeft(15);
      
      // Start countdown
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            
            // After countdown, rewind to checkpoint
            if (videoRef.current) {
              videoRef.current.currentTime = previousCheckpoint.time;
              videoRef.current.play();
            }
            
            setIsPaused(false);
            setCurrentCheckpoint(null);
            setTimeLeft(15);
            
            console.log(`Reflection complete. Rewound to: "${previousCheckpoint.title}"`);
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      
      console.log(`Paused for reflection. Will rewind to: "${previousCheckpoint.title}"`);
    }
  };

  return (
    <PauseReflectContext.Provider value={{ 
      triggerPauseReflect, 
      setVideoRef, 
      isPaused, 
      timeLeft, 
      currentCheckpoint 
    }}>
      {children}
    </PauseReflectContext.Provider>
  );
};

export default PauseReflectHandler;