import React, { createContext, useContext, useRef, useState } from 'react';
import goodAudio from '../assets/Good.mp3'; // Add this import
import badAudio from '../assets/Bad.mp3'; // Add this import

interface Question {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Checkpoint {
  time: number;
  title: string;
  questions: Question[];
}

interface QuestionContextType {
  triggerQuestion: () => void;
  setVideoRef: (ref: HTMLVideoElement | null) => void;
  setMessageCallback: (callback: (message: string) => void) => void;
  isQuestionActive: boolean;
  currentQuestion: Question | null;
  handleAnswer: (answer: string) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
  currentCheckpoint: Checkpoint | null;
  showCountdown: boolean;
  handleCountdownComplete: () => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const useQuestion = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestion must be used within a QuestionHandler');
  }
  return context;
};

interface QuestionHandlerProps {
  children: React.ReactNode;
}

const QuestionHandler: React.FC<QuestionHandlerProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageCallbackRef = useRef<((message: string) => void) | null>(null);
  const goodAudioRef = useRef<HTMLAudioElement>(null); // Add audio ref for correct answers
  const badAudioRef = useRef<HTMLAudioElement>(null); // Add audio ref for incorrect answers
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  // Video checkpoints with quiz questions
  const checkpoints: Checkpoint[] = [
    {
      time: 0,
      title: "Introduction to bacteriophages",
      questions: [
        {
          question: "What shape is a bacteriophage's head?",
          type: "multiple-choice",
          options: ["Cube", "Sphere", "Icosahedron", "Pyramid"],
          correctAnswer: "Icosahedron",
          explanation: "A phage head is an icosahedron, like a 20-sided dice with 30 points!"
        },
        {
          question: "Bacteriophages are fully alive organisms.",
          type: "true-false",
          correctAnswer: "False",
          explanation: "Phages are not exactly alive, but not really dead either - they're viruses!"
        },
        {
          question: "How long has the war between phages and bacteria been going on?",
          type: "multiple-choice",
          options: ["Millions of years", "Billions of years", "Thousands of years", "Hundreds of years"],
          correctAnswer: "Billions of years",
          explanation: "This microscopic war has been raging for billions of years!"
        }
      ]
    },
    {
      time: 48,
      title: "Phages outnumber all organisms",
      questions: [
        {
          question: "Phages are the most numerous organisms on Earth.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "There are more phages than any other organism combined, including bacteria!"
        },
        {
          question: "What percentage of ocean bacteria do phages kill daily?",
          type: "multiple-choice",
          options: ["10%", "25%", "40%", "60%"],
          correctAnswer: "40%",
          explanation: "Up to 40% of all bacteria in the ocean get wiped out by phages every day!"
        },
        {
          question: "Phages can be found in your eyes and gut right now.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "Billions of phages are in your hands, gut, and eyes right now!"
        }
      ]
    },
    {
      time: 85,
      title: "How phages infect bacteria",
      questions: [
        {
          question: "How do phages choose their targets?",
          type: "multiple-choice",
          options: ["Randomly", "By size", "They specialize in specific bacteria", "By color"],
          correctAnswer: "They specialize in specific bacteria",
          explanation: "Phages are very specialized - they usually pick a specific bacterium and maybe some close relatives!"
        },
        {
          question: "Phages can attack any type of bacteria.",
          type: "true-false",
          correctAnswer: "False",
          explanation: "Phages are like rockets that only hunt down specific bacterial families!"
        },
        {
          question: "How does a phage enter a bacterium?",
          type: "multiple-choice",
          options: ["It dissolves the wall", "It uses a syringe-like mechanism", "It explodes the cell", "It squeezes through pores"],
          correctAnswer: "It uses a syringe-like mechanism",
          explanation: "The phage uses a kind of syringe to drill a hole and inject its genetic material!"
        }
      ]
    },
    {
      time: 117,
      title: "Phage replication and bacterial death",
      questions: [
        {
          question: "What happens to the bacterium after phage infection?",
          type: "multiple-choice",
          options: ["It becomes stronger", "It's forced to make new phages", "It fights back", "It goes dormant"],
          correctAnswer: "It's forced to make new phages",
          explanation: "The bacterium is taken over and forced to make new phages until it's packed full!"
        },
        {
          question: "The bacterium dies by 'puking out' its insides.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "Endolysin creates so much pressure that the bacterium pukes out all its insides and dies!"
        },
        {
          question: "What enzyme causes the bacterium to burst?",
          type: "multiple-choice",
          options: ["Protease", "Endolysin", "Lipase", "Amylase"],
          correctAnswer: "Endolysin",
          explanation: "Endolysin is the powerful enzyme that drills holes and causes the bacterium to burst!"
        }
      ]
    },
    {
      time: 154,
      title: "Humans discover antibiotics",
      questions: [
        {
          question: "How were antibiotics discovered?",
          type: "multiple-choice",
          options: ["Through careful planning", "By accident", "Through computer modeling", "By studying phages"],
          correctAnswer: "By accident",
          explanation: "We discovered antibiotics by chance when we found micro-fungi that produced bacteria-killing poisons!"
        },
        {
          question: "Before antibiotics, a sip of dirty water could kill you.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "Before antibiotics, bacteria were our deadly enemies - even dirty water could be fatal!"
        },
        {
          question: "How long ago did we discover antibiotics?",
          type: "multiple-choice",
          options: ["50 years ago", "100 years ago", "200 years ago", "500 years ago"],
          correctAnswer: "100 years ago",
          explanation: "We discovered antibiotics about 100 years ago, completely changing medicine!"
        }
      ]
    },
    {
      time: 187,
      title: "Antibiotic overuse and resistance",
      questions: [
        {
          question: "Why did bacteria become resistant to antibiotics?",
          type: "multiple-choice",
          options: ["They got stronger", "We overused antibiotics", "They learned to hide", "They formed alliances"],
          correctAnswer: "We overused antibiotics",
          explanation: "We started using antibiotics for less serious illnesses, giving bacteria time to evolve resistance!"
        },
        {
          question: "Bacteria can evolve and become immune to our drugs.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "Bacteria are living beings that evolve gradually and began becoming immune to our weapons!"
        },
        {
          question: "What did we create by overusing antibiotics?",
          type: "multiple-choice",
          options: ["Superbugs", "Megavirus", "Hypergerms", "Ultrabes"],
          correctAnswer: "Superbugs",
          explanation: "Our overuse created 'superbugs' - bacteria immune to every drug we made!"
        }
      ]
    },
    {
      time: 222,
      title: "Rise of superbugs and threat",
      questions: [
        {
          question: "By 2050, superbugs could kill more people than which disease?",
          type: "multiple-choice",
          options: ["Heart disease", "Cancer", "Diabetes", "Stroke"],
          correctAnswer: "Cancer",
          explanation: "By 2050, superbugs could kill more people each year than cancer!"
        },
        {
          question: "In the US, over 23,000 people die yearly from drug-resistant bacteria.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "This is a current reality - antibiotic resistance is already claiming thousands of lives!"
        },
        {
          question: "What era might we be returning to?",
          type: "multiple-choice",
          options: ["Stone Age", "Pre-antibiotic times", "Medieval times", "Industrial Revolution"],
          correctAnswer: "Pre-antibiotic times",
          explanation: "We might return to pre-antibiotic times when simple cuts and infections could kill!"
        }
      ]
    },
    {
      time: 254,
      title: "Phages as targeted antibacterial agents",
      questions: [
        {
          question: "How are phages different from antibiotics?",
          type: "multiple-choice",
          options: ["They're stronger", "They're guided missiles vs bombs", "They're cheaper", "They're faster"],
          correctAnswer: "They're guided missiles vs bombs",
          explanation: "Phages are like guided missiles targeting specific bacteria, while antibiotics bomb everything!"
        },
        {
          question: "Humans are completely immune to phages.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "We're so different from bacteria that phages simply ignore us - we encounter billions daily!"
        },
        {
          question: "What's the problem with antibiotics compared to phages?",
          type: "multiple-choice",
          options: ["Too expensive", "Kill good bacteria too", "Work too slowly", "Taste bad"],
          correctAnswer: "Kill good bacteria too",
          explanation: "Antibiotics are like carpet bombing that kills everything, including beneficial bacteria!"
        }
      ]
    },
    {
      time: 288,
      title: "Phage-bacteria evolutionary arms race",
      questions: [
        {
          question: "Who's been winning the billions-year battle?",
          type: "multiple-choice",
          options: ["Bacteria", "Phages", "It's a tie", "Nobody"],
          correctAnswer: "Phages",
          explanation: "So far, phages have been winning this evolutionary arms race over billions of years!"
        },
        {
          question: "Phages keep improving their killing skills through evolution.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "This makes phages smart killers that continuously improve their abilities!"
        },
        {
          question: "What happens when bacteria resist phages?",
          type: "multiple-choice",
          options: ["They become stronger", "They give up antibiotic resistance", "They multiply faster", "They hide better"],
          correctAnswer: "They give up antibiotic resistance",
          explanation: "To resist phages, bacteria often have to give up their antibiotic resistance - a win-win!"
        }
      ]
    },
    {
      time: 325,
      title: "Phage therapy successes",
      questions: [
        {
          question: "What bacteria was successfully treated with phage therapy?",
          type: "multiple-choice",
          options: ["E. coli", "Pseudomonas Aeruginosa", "Staphylococcus", "Streptococcus"],
          correctAnswer: "Pseudomonas Aeruginosa",
          explanation: "This scary bacteria infects chest cavities and resists almost all antibiotics!"
        },
        {
          question: "The patient was treated by injecting phages directly into their chest.",
          type: "true-false",
          correctAnswer: "True",
          explanation: "Thousands of phages were injected directly into the patient's chest cavity!"
        },
        {
          question: "Pseudomonas Aeruginosa can survive what?",
          type: "multiple-choice",
          options: ["Boiling water", "Alcoholic hand sanitizer", "Freezing temperatures", "Acid"],
          correctAnswer: "Alcoholic hand sanitizer",
          explanation: "This superbug is so tough it can even survive alcoholic hand sanitizer!"
        }
      ]
    },
    {
      time: 356,
      title: "Experimental status and clinical trials",
      questions: [
        {
          question: "When did large clinical trials for phage therapy begin?",
          type: "multiple-choice",
          options: ["2010", "2016", "2020", "2024"],
          correctAnswer: "2016",
          explanation: "In 2016, a large clinical trial for phage therapy began, marking progress in the field!"
        },
        {
          question: "Phage therapy has received full official approval.",
          type: "true-false",
          correctAnswer: "False",
          explanation: "This treatment is still experimental and hasn't received full official approval yet!"
        },
        {
          question: "Why are pharmaceutical companies hesitant to invest?",
          type: "multiple-choice",
          options: ["Too expensive", "No official approval yet", "Too risky", "Not profitable"],
          correctAnswer: "No official approval yet",
          explanation: "Companies are hesitant to invest billions in therapy that hasn't received official approval!"
        }
      ]
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

  const findPreviousCheckpoint = (currentTime: number): Checkpoint => {
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

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    
    // Resume video
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
    
    // Play appropriate audio feedback
    if (correct) {
      if (goodAudioRef.current) {
        goodAudioRef.current.play().catch(error => {
          console.log('Good audio play prevented:', error);
        });
      }
    } else {
      if (badAudioRef.current) {
        badAudioRef.current.play().catch(error => {
          console.log('Bad audio play prevented:', error);
        });
      }
    }
    
    // Pause the video while showing explanation
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Different timeouts based on correct/incorrect
    const timeout = correct ? 5000 : 8000; // Longer for incorrect to show encouragement
    
    setTimeout(() => {
      setShowExplanation(false);
      setIsQuestionActive(false);
      setCurrentQuestion(null);
      setIsCorrect(null);
      
      if (videoRef.current) {
        if (!correct) {
          // If incorrect, rewind to previous checkpoint
          const currentTime = videoRef.current.currentTime;
          const previousCheckpoint = findPreviousCheckpoint(currentTime);
          videoRef.current.currentTime = previousCheckpoint.time;
          
          // Send encouraging message
          if (messageCallbackRef.current) {
            messageCallbackRef.current(`💪 No worries! Let's revisit "${previousCheckpoint.title}" to strengthen your understanding.`);
          }
        }
        
        // Show countdown before resuming
        setShowCountdown(true);
      }
    }, timeout);
  };

  const triggerQuestion = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const checkpoint = findCurrentCheckpoint(currentTime);
      
      // Pick a random question from the current checkpoint
      const randomQuestion = checkpoint.questions[Math.floor(Math.random() * checkpoint.questions.length)];
      
      // Pause video and show question overlay
      videoRef.current.pause();
      setCurrentQuestion(randomQuestion);
      setCurrentCheckpoint(checkpoint);
      setIsQuestionActive(true);
      setShowExplanation(false);
      setIsCorrect(null);
      
      console.log(`Asked question for: "${checkpoint.title}" - ${randomQuestion.question}`);
    }
  };

  return (
    <QuestionContext.Provider value={{ 
      triggerQuestion, 
      setVideoRef, 
      setMessageCallback,
      isQuestionActive,
      currentQuestion,
      handleAnswer,
      showExplanation,
      isCorrect,
      currentCheckpoint,
      showCountdown,
      handleCountdownComplete
    }}>
      {/* Hidden audio elements for feedback */}
      <audio
        ref={goodAudioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={goodAudio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <audio
        ref={badAudioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={badAudio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {children}
    </QuestionContext.Provider>
  );
};

export default QuestionHandler;
