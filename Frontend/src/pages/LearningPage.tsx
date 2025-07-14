import React, { useEffect, useState, useRef } from 'react';
import LearningVideo from '../components/LearningVideo';
import MessageBox from '../components/MessageBox';
import WebcamBox from '../components/WebcamBox';
import EncouragementHandler from '../microadaptations/EncouragementHandler';
import RewindHandler, { useRewind } from '../microadaptations/RewindHandler';
import PauseReflectHandler, { usePauseReflect } from '../microadaptations/PauseReflectHandler';
import QuestionHandler, { useQuestion } from '../microadaptations/QuestionHandler';
import SummaryHandler, { useSummary } from '../microadaptations/SummaryHandler';
import SlowPlaybackHandler, { useSlowPlayback } from '../microadaptations/SlowPlaybackHandler';
import beginAudio from '../assets/begin.mp3'; // Add this import
import '../styles/LearningPage.css';

const LearningPage: React.FC = () => {
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [videoCanStart, setVideoCanStart] = useState(false);
  const beginAudioRef = useRef<HTMLAudioElement>(null); // Add audio ref

  const handleBeginLearning = () => {
    // Play begin audio first
    if (beginAudioRef.current) {
      beginAudioRef.current.play().catch(error => {
        console.log('Audio play prevented:', error);
        // If audio fails, start countdown immediately
        setShowWelcomeOverlay(false);
        setShowCountdown(true);
      });
      
      // Listen for audio end event to start countdown with small delay
      beginAudioRef.current.onended = () => {
        setTimeout(() => {
          setShowWelcomeOverlay(false);
          setShowCountdown(true);
        }, 500); // 500ms delay after audio ends
      };
    } else {
      // If no audio ref, start countdown immediately
      setShowWelcomeOverlay(false);
      setShowCountdown(true);
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setVideoCanStart(true);
  };

  return (
    <div className="learning-wrapper">
      {/* Hidden audio element for begin sound */}
      <audio
        ref={beginAudioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src={beginAudio} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <RewindHandler>
        <PauseReflectHandler>
          <QuestionHandler>
            <SummaryHandler>
              <SlowPlaybackHandler>
                <EncouragementHandler>
                  {({ messages, triggerEncouragement, addMessage }) => (
                    <>
                      {/* Left Panel: Webcam */}
                      <div className="left-panel">
                        <div className="user-video-wrapper-container">
                          <div className="user-video-wrapper maximized">
                            <div className="webcam-container">
                              <div className="user-video">
                                <WebcamBox />
                              </div>
                            </div>
                          </div>
                        </div>
                        <MessageBox messages={messages} />
                      </div>

                      {/* Right Panel: Video and Message Feed */}
                      <div className="right-panel">
                        <div className="main-video">
                          <LearningVideo 
                            canStart={videoCanStart}
                            showWelcomeOverlay={showWelcomeOverlay}
                            showCountdown={showCountdown}
                            onBeginLearning={handleBeginLearning}
                            onCountdownComplete={handleCountdownComplete}
                          />
                        </div>
                      </div>
                      
                      {/* Debug Panel for Testing Microadaptations */}
                      <RewindDebugPanel 
                        triggerEncouragement={triggerEncouragement}
                        addMessage={addMessage}
                      />
                    </>
                  )}
                </EncouragementHandler>
              </SlowPlaybackHandler>
            </SummaryHandler>
          </QuestionHandler>
        </PauseReflectHandler>
      </RewindHandler>
    </div>
  );
};

// Separate component to access all contexts
const RewindDebugPanel: React.FC<{ 
  triggerEncouragement: () => void;
  addMessage: (text: string, type?: 'system' | 'user' | 'encouragement' | 'rewind' | 'question') => void;
}> = ({ triggerEncouragement, addMessage }) => {
  const { triggerRewind, setMessageCallback: setRewindCallback } = useRewind();
  const { triggerPauseReflect } = usePauseReflect();
  const { triggerQuestion, setMessageCallback: setQuestionCallback } = useQuestion();
  const { triggerSummary, setMessageCallback: setSummaryCallback } = useSummary();
  const { triggerSlowPlayback, setMessageCallback: setSlowPlaybackCallback } = useSlowPlayback();

  useEffect(() => {
    // Connect handlers to the message system
    setRewindCallback((message: string) => {
      addMessage(message, 'rewind');
    });
    
    setQuestionCallback((message: string) => {
      addMessage(message, 'question');
    });
    
    setSummaryCallback((message: string) => {
      addMessage(message, 'system');
    });
    
    setSlowPlaybackCallback((message: string) => {
      addMessage(message, 'system');
    });
  }, [setRewindCallback, setQuestionCallback, setSummaryCallback, setSlowPlaybackCallback, addMessage]);

  return (
    <div className="debug-panel">
      <button onClick={triggerRewind}>Rewind to Checkpoint</button>
      <button onClick={triggerPauseReflect}>Pause & Reflect</button>
      <button onClick={triggerSlowPlayback}>Slow Playback</button>
      <button onClick={triggerSummary}>Show Summary</button>
      <button onClick={triggerEncouragement}>Encourage</button>
      <button onClick={triggerQuestion}>Ask Question</button>
    </div>
  );
};

export default LearningPage;