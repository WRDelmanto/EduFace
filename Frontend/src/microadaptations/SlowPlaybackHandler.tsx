import React, { createContext, useContext, useRef, useState } from 'react';

interface Checkpoint {
  time: number;
  title: string;
}

interface SlowPlaybackContextType {
  triggerSlowPlayback: () => void;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  setMessageCallback: (callback: (message: string) => void) => void;
  isSlowPlaybackActive: boolean;
  currentCheckpoint: Checkpoint | null;
  normalizeSpeed: () => void;
  showOverlay: boolean;
}

const SlowPlaybackContext = createContext<SlowPlaybackContextType | undefined>(undefined);

export const useSlowPlayback = () => {
  const context = useContext(SlowPlaybackContext);
  if (!context) {
    throw new Error('useSlowPlayback must be used within a SlowPlaybackHandler');
  }
  return context;
};

interface SlowPlaybackHandlerProps {
  children: React.ReactNode;
}

const SlowPlaybackHandler: React.FC<SlowPlaybackHandlerProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageCallbackRef = useRef<((message: string) => void) | null>(null);
  const [isSlowPlaybackActive, setIsSlowPlaybackActive] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const originalSpeedRef = useRef<number>(1);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);

  // Video checkpoints for slow playback
  const checkpoints: Checkpoint[] = [
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

  const findNearestCheckpoint = (currentTime: number): Checkpoint => {
    let nearestCheckpoint = checkpoints[0];
    
    for (let i = 0; i < checkpoints.length; i++) {
      if (checkpoints[i].time <= currentTime) {
        nearestCheckpoint = checkpoints[i];
      } else {
        break;
      }
    }
    
    return nearestCheckpoint;
  };

  const findNextCheckpoint = (currentTime: number): Checkpoint | null => {
    for (let i = 0; i < checkpoints.length; i++) {
      if (checkpoints[i].time > currentTime) {
        return checkpoints[i];
      }
    }
    return null; // No next checkpoint (end of video)
  };

  const normalizeSpeed = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = originalSpeedRef.current;
      setIsSlowPlaybackActive(false);
      setShowOverlay(false);
      setCurrentCheckpoint(null);
      
      // Remove time update listener
      if (timeUpdateHandlerRef.current && videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', timeUpdateHandlerRef.current);
        timeUpdateHandlerRef.current = null;
      }
      
      if (messageCallbackRef.current) {
        messageCallbackRef.current('🎬 Playback speed returned to normal. Keep learning!');
      }
    }
  };

  const triggerSlowPlayback = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const nearestCheckpoint = findNearestCheckpoint(currentTime);
      const nextCheckpoint = findNextCheckpoint(currentTime);
      
      // Store original speed if not already stored
      if (!isSlowPlaybackActive) {
        originalSpeedRef.current = videoRef.current.playbackRate;
      }
      
      // Rewind to nearest checkpoint
      videoRef.current.currentTime = nearestCheckpoint.time;
      
      // Set slow playback speed (0.75x speed)
      videoRef.current.playbackRate = 0.75;
      
      // Update state
      setIsSlowPlaybackActive(true);
      setShowOverlay(true);
      setCurrentCheckpoint(nearestCheckpoint);
      
      // Hide overlay after 5 seconds
      setTimeout(() => {
        setShowOverlay(false);
      }, 5000);
      
      // Set up time update listener to normalize speed at next checkpoint
      if (nextCheckpoint) {
        const timeUpdateHandler = () => {
          if (videoRef.current && videoRef.current.currentTime >= nextCheckpoint.time) {
            normalizeSpeed();
          }
        };
        
        timeUpdateHandlerRef.current = timeUpdateHandler;
        videoRef.current.addEventListener('timeupdate', timeUpdateHandler);
      } else {
        // If no next checkpoint, auto-normalize after 30 seconds as fallback
        setTimeout(() => {
          if (videoRef.current && isSlowPlaybackActive) {
            normalizeSpeed();
          }
        }, 30000);
      }
      
      // Send encouraging message
      if (messageCallbackRef.current) {
        const nextCheckpointText = nextCheckpoint 
          ? ` Speed will return to normal at "${nextCheckpoint.title}".`
          : ' Speed will return to normal automatically.';
        
        messageCallbackRef.current(
          `🐌 Slowing down to help you focus! Rewound to "${nearestCheckpoint.title}" at 0.75x speed.${nextCheckpointText}`
        );
      }
      
      console.log(`Slow playback activated for: "${nearestCheckpoint.title}"`);
    }
  };

  return (
    <SlowPlaybackContext.Provider value={{ 
      triggerSlowPlayback, 
      setVideoRef, 
      setMessageCallback,
      isSlowPlaybackActive,
      currentCheckpoint,
      normalizeSpeed,
      showOverlay
    }}>
      {children}
    </SlowPlaybackContext.Provider>
  );
};

export default SlowPlaybackHandler;