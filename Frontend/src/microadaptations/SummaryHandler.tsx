import React, { createContext, useContext, useRef, useState } from 'react';

interface SummaryPoint {
  title: string;
  description: string;
  keyFacts: string[];
  emoji: string;
}

interface Checkpoint {
  time: number;
  title: string;
  summary: SummaryPoint;
}

interface SummaryContextType {
  triggerSummary: () => void;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  setMessageCallback: (callback: (message: string) => void) => void;
  isSummaryActive: boolean;
  currentSummary: SummaryPoint | null;
  closeSummary: () => void;
  currentCheckpoint: Checkpoint | null;
  showCountdown: boolean;
  handleCountdownComplete: () => void;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

export const useSummary = () => {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error('useSummary must be used within a SummaryHandler');
  }
  return context;
};

interface SummaryHandlerProps {
  children: React.ReactNode;
}

const SummaryHandler: React.FC<SummaryHandlerProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageCallbackRef = useRef<((message: string) => void) | null>(null);
  const [isSummaryActive, setIsSummaryActive] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<SummaryPoint | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  // Video checkpoints with comprehensive summaries
  const checkpoints: Checkpoint[] = [
    {
      time: 0,
      title: "Introduction to bacteriophages",
      summary: {
        title: "Meet the Bacteriophages",
        description: "Discover the microscopic warriors that have been fighting an invisible war for billions of years.",
        keyFacts: [
          "🦠 Phages are viruses - not exactly alive, but not really dead either",
          "🎲 Their head is an icosahedron (20-sided dice shape with 30 points)",
          "⚔️ This war has been going on for billions of years, killing trillions daily",
          "🧬 They contain genetic material and have tail fibers that act like legs"
        ],
        emoji: "🦠"
      }
    },
    {
      time: 48,
      title: "Phages outnumber all organisms",
      summary: {
        title: "The Most Numerous Life Forms",
        description: "Phages are everywhere and vastly outnumber all other organisms on Earth combined.",
        keyFacts: [
          "🌍 More phages exist than any other organism combined, including bacteria",
          "👁️ Billions are in your hands, gut, and eyes right now",
          "🌊 Up to 40% of ocean bacteria are killed by phages daily",
          "☠️ They cause a 'genocide' every morning but only target bacteria"
        ],
        emoji: "🌍"
      }
    },
    {
      time: 85,
      title: "How phages infect bacteria",
      summary: {
        title: "The Infection Process",
        description: "Learn how phages are highly specialized killers that target specific bacterial families.",
        keyFacts: [
          "🎯 Phages specialize in specific bacteria and their close relatives",
          "🚀 They work like rockets hunting down members of an unlucky family",
          "💉 They use a syringe-like mechanism to drill holes and inject genetic material",
          "🔗 They attach using tail fibers to specific bacterial receptors"
        ],
        emoji: "🎯"
      }
    },
    {
      time: 117,
      title: "Phage replication and bacterial death",
      summary: {
        title: "Takeover and Destruction",
        description: "Once inside, phages completely hijack bacterial cells to reproduce themselves.",
        keyFacts: [
          "⏱️ Within minutes, the bacterium is completely taken over",
          "🏭 The bacterium is forced to make new phages until it's packed full",
          "🔬 Endolysin enzyme drills holes causing massive pressure buildup",
          "💥 The bacterium 'pukes out' all its insides and dies, releasing new phages"
        ],
        emoji: "💥"
      }
    },
    {
      time: 154,
      title: "Humans discover antibiotics",
      summary: {
        title: "The Antibiotic Revolution",
        description: "How humans accidentally discovered the weapon that changed medicine forever.",
        keyFacts: [
          "☠️ Before antibiotics, dirty water could kill you",
          "🍄 We discovered micro-fungi that produced bacteria-killing poisons by chance",
          "⚔️ Antibiotics became our 'super powerful weapon' about 100 years ago",
          "🛡️ Only the elderly and weakest were still dying from bacterial infections"
        ],
        emoji: "💊"
      }
    },
    {
      time: 187,
      title: "Antibiotic overuse and resistance",
      summary: {
        title: "The Rise of Resistance",
        description: "How overuse of antibiotics led to the creation of deadly superbugs.",
        keyFacts: [
          "😔 We started using antibiotics for less and less serious illnesses",
          "🧬 Bacteria evolved gradually and became immune to our weapons",
          "🦹 We created 'superbugs' - bacteria immune to every drug we made",
          "🌍 Their resistance is spreading worldwide even as we speak"
        ],
        emoji: "🦹"
      }
    },
    {
      time: 222,
      title: "Rise of superbugs and threat",
      summary: {
        title: "The Superbug Crisis",
        description: "The alarming reality of antibiotic resistance and its deadly consequences.",
        keyFacts: [
          "📈 By 2050, superbugs could kill more people yearly than cancer",
          "💀 Over 23,000 people die yearly in the US from drug-resistant bacteria",
          "⏰ We're returning to pre-antibiotic times when cuts could kill",
          "🔄 Simple infections and coughs could become deadly again"
        ],
        emoji: "⚠️"
      }
    },
    {
      time: 254,
      title: "Phages as targeted antibacterial agents",
      summary: {
        title: "Phages as Precision Medicine",
        description: "Why phages might be the solution to our antibiotic resistance crisis.",
        keyFacts: [
          "🎯 Phages are like guided missiles vs antibiotics being bombs",
          "🛡️ Humans are completely immune to phages - we're too different",
          "👥 We encounter billions of phages daily and ignore each other politely",
          "💊 Antibiotics kill everything, including beneficial bacteria we need"
        ],
        emoji: "🎯"
      }
    },
    {
      time: 288,
      title: "Phage-bacteria evolutionary arms race",
      summary: {
        title: "The Evolutionary Battle",
        description: "The billions-year arms race between phages and bacteria continues.",
        keyFacts: [
          "🏆 Phages have been winning this evolutionary battle for billions of years",
          "🧠 This makes phages 'smart killers' that keep improving their skills",
          "⚖️ When bacteria resist phages, they give up antibiotic resistance",
          "🪤 We might trap bacteria in a 'dead-end trap' - a win-win situation"
        ],
        emoji: "⚔️"
      }
    },
    {
      time: 325,
      title: "Phage therapy successes",
      summary: {
        title: "Real-World Success Stories",
        description: "Actual patients have been successfully treated with phage therapy.",
        keyFacts: [
          "🦠 Pseudomonas Aeruginosa - one of the scariest bacteria was defeated",
          "💪 This superbug survives alcoholic hand sanitizer and resists most antibiotics",
          "💉 Thousands of phages were injected directly into the patient's chest",
          "✅ After weeks of suffering, the infection was completely gone"
        ],
        emoji: "🏥"
      }
    },
    {
      time: 356,
      title: "Experimental status and clinical trials",
      summary: {
        title: "The Future of Phage Therapy",
        description: "Current status and future prospects of phage therapy in medicine.",
        keyFacts: [
          "🔬 Phage therapy is still experimental without full official approval",
          "💰 Pharmaceutical companies are hesitant to invest billions without approval",
          "📅 Large clinical trials for phage therapy began in 2016",
          "🌟 This method is gaining more and more attention in the medical world"
        ],
        emoji: "🔬"
      }
    }
  ];

  const setVideoRef = (ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  };

  const setMessageCallback = (callback: (message: string) => void) => {
    messageCallbackRef.current = callback;
  };

  const findCurrentCheckpoint = (currentTime: number): Checkpoint => {
    let currentCheckpoint = checkpoints[0];
    
    for (let i = 0; i < checkpoints.length; i++) {
      if (checkpoints[i].time <= currentTime) {
        currentCheckpoint = checkpoints[i];
      } else {
        break;
      }
    }
    
    return currentCheckpoint;
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    
    // Resume video
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const closeSummary = () => {
    setIsSummaryActive(false);
    setCurrentSummary(null);
    setCurrentCheckpoint(null);
    
    // Show countdown before resuming
    setShowCountdown(true);
  };

  const triggerSummary = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const checkpoint = findCurrentCheckpoint(currentTime);
      
      // Pause video and show summary overlay
      videoRef.current.pause();
      setCurrentSummary(checkpoint.summary);
      setCurrentCheckpoint(checkpoint);
      setIsSummaryActive(true);
      
      // Send message to chat
      if (messageCallbackRef.current) {
        messageCallbackRef.current(`📋 Here's a summary of "${checkpoint.title}" to help consolidate your learning!`);
      }
      
      console.log(`Showing summary for: "${checkpoint.title}"`);
    }
  };

  return (
    <SummaryContext.Provider value={{ 
      triggerSummary, 
      setVideoRef, 
      setMessageCallback,
      isSummaryActive,
      currentSummary,
      closeSummary,
      currentCheckpoint,
      showCountdown,
      handleCountdownComplete
    }}>
      {children}
    </SummaryContext.Provider>
  );
};

export default SummaryHandler;