import React, { useEffect, useRef, useState } from 'react';
import learningVideo from '../assets/learningvideo.mp4';
import { useRewind } from '../microadaptations/RewindHandler';
import { usePauseReflect } from '../microadaptations/PauseReflectHandler';
import { useQuestion } from '../microadaptations/QuestionHandler';
import { useSummary } from '../microadaptations/SummaryHandler';
import { useSlowPlayback } from '../microadaptations/SlowPlaybackHandler';
import CountdownOverlay from './CountdownOverlay';

interface LearningVideoProps {
  canStart: boolean;
  showWelcomeOverlay: boolean;
  showCountdown: boolean;
  onBeginLearning: () => void;
  onCountdownComplete: () => void;
  pausedForFace?: boolean; // Add this prop
  dominantEmotion?: string;
  emotionPercentage?: number;
}

const LearningVideo: React.FC<LearningVideoProps> = ({
  canStart,
  showWelcomeOverlay,
  showCountdown,
  onBeginLearning,
  onCountdownComplete,
  pausedForFace, // Destructure the new prop
  dominantEmotion = '',
  emotionPercentage = 0
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  const { setVideoRef: setRewindVideoRef, isRewinding, currentCheckpoint: rewindCheckpoint } = useRewind();
  const { setVideoRef: setPauseVideoRef, isPaused, timeLeft, currentCheckpoint: pauseCheckpoint } = usePauseReflect();
  const { 
    setVideoRef: setQuestionVideoRef, 
    isQuestionActive, 
    currentQuestion, 
    handleAnswer, 
    showExplanation, 
    isCorrect,
    currentCheckpoint: questionCheckpoint,
    showCountdown: showQuestionCountdown,
    handleCountdownComplete: handleQuestionCountdownComplete
  } = useQuestion();
  const { 
    setVideoRef: setSummaryVideoRef, 
    isSummaryActive, 
    currentSummary, 
    closeSummary,
    currentCheckpoint: summaryCheckpoint,
    showCountdown: showSummaryCountdown,
    handleCountdownComplete: handleSummaryCountdownComplete
  } = useSummary();
  const { 
    setVideoRef: setSlowPlaybackVideoRef, 
    isSlowPlaybackActive, 
    currentCheckpoint: slowPlaybackCheckpoint,
    normalizeSpeed,
    showOverlay
  } = useSlowPlayback();

  useEffect(() => {
    if (videoRef.current) {
      setRewindVideoRef(videoRef.current);
      setPauseVideoRef(videoRef.current);
      setQuestionVideoRef(videoRef.current);
      setSummaryVideoRef(videoRef.current);
      setSlowPlaybackVideoRef(videoRef.current);
    }
  }, [setRewindVideoRef, setPauseVideoRef, setQuestionVideoRef, setSummaryVideoRef, setSlowPlaybackVideoRef]);

  useEffect(() => {
    if (showCountdown) {
      setCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setTimeout(() => {
              onCountdownComplete();
              // Start video playback
              if (videoRef.current) {
                videoRef.current.play();
              }
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [showCountdown, onCountdownComplete]);

  // Calculate circle stroke for timer
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 15) * circumference;

  // Get encouraging messages
  const getEncouragingMessages = () => {
    const messages = [
      "Let's take a moment to review these fascinating concepts! 🧬",
      "Perfect time to check your understanding! 🌟",
      "Let's see how well you've grasped these amazing ideas! 💡",
      "Time for a quick knowledge check! 🚀",
      "Let's pause and reflect on what we've learned! 🤔"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getCorrectMessages = () => {
    const messages = [
      "Excellent work! You're really understanding this! 🎉",
      "Outstanding! Your knowledge is growing strong! ⭐",
      "Brilliant! You've got this concept down! 💪",
      "Perfect! You're mastering these ideas! 🌟",
      "Fantastic! Keep up this great learning! 🚀"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getIncorrectMessages = () => {
    const messages = [
      "That's perfectly okay! Learning is a journey, not a race. Let's revisit this concept together! 🤗",
      "No worries at all! Every great learner makes mistakes. Let's go back and strengthen your understanding! 💪",
      "That's completely fine! The best way to learn is through exploration. Let's review this topic again! 🌱",
      "Don't worry! Even experts had to learn step by step. Let's take another look at this important concept! 🎯",
      "That's alright! Making mistakes is how we grow. Let's go back and build your confidence with this topic! 🌟"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  useEffect(() => {
    if (videoRef.current) {
      if (pausedForFace) {
        videoRef.current.pause();
      } else if (canStart && !showWelcomeOverlay && !showCountdown) {
        videoRef.current.play();
      }
    }
  }, [pausedForFace, canStart, showWelcomeOverlay, showCountdown]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        controls={canStart}
        width="100%"
        height="100%"
        style={{ objectFit: 'contain' }}
        muted={!canStart}
      >
        <source src={learningVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Welcome Overlay */}
      {showWelcomeOverlay && (
        <div className="welcome-learning-overlay">
          <div className="welcome-learning-content">
            <div className="welcome-icon">🎓</div>
            <h2>Welcome to Your Learning Session!</h2>
            <p>Get ready to explore the fascinating world of bacteriophages and their role in modern medicine.</p>
            <button className="begin-learning-btn" onClick={onBeginLearning}>
              <span>Begin Learning Session</span>
              <span className="play-icon">▶️</span>
            </button>
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {showCountdown && (
        <CountdownOverlay onComplete={onCountdownComplete} />
      )}

      {/* Rewind Overlay */}
      {isRewinding && (
        <div className="rewind-overlay">
          <div className="rewind-content">
            <div className="rewind-icon">⏪</div>
            <div className="rewind-text">Rewinding to checkpoint</div>
            {rewindCheckpoint && (
              <div className="checkpoint-name">
                "{rewindCheckpoint.title}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pause & Reflect Overlay */}
      {isPaused && (
        <div className="pause-reflect-overlay">
          <div className="pause-reflect-content">
            <div className="pause-icon">⏸️</div>
            <div className="pause-text">Take a moment to reflect</div>
            
            <div className="timer-container">
              <svg className="timer-circle" width="100" height="100">
                <circle
                  className="timer-background"
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="6"
                />
                <circle
                  className="timer-progress"
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="timer-number">{timeLeft}</div>
            </div>
            
            {pauseCheckpoint && (
              <div className="next-checkpoint">
                Will return to: "{pauseCheckpoint.title}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Overlay */}
      {isQuestionActive && currentQuestion && (
        <div className="question-overlay">
          <div className="question-content">
            {!showExplanation ? (
              <>
                {/* Encouraging Header */}
                <div className="encouraging-header">
                  <div className="encouraging-icon">✨</div>
                  <div className="encouraging-text">
                    {getEncouragingMessages()}
                  </div>
                  {questionCheckpoint && (
                    <div className="topic-indicator">
                      Topic: {questionCheckpoint.title}
                    </div>
                  )}
                </div>

                <div className="question-icon">🤔</div>
                <div className="question-text">{currentQuestion.question}</div>
                
                <div className="question-options">
                  {currentQuestion.type === 'multiple-choice' ? (
                    currentQuestion.options?.map((option, index) => (
                      <button
                        key={index}
                        className="question-option"
                        onClick={() => handleAnswer(option)}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        className="question-option"
                        onClick={() => handleAnswer('True')}
                      >
                        A. True
                      </button>
                      <button
                        className="question-option"
                        onClick={() => handleAnswer('False')}
                      >
                        B. False
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="explanation-content">
                <div className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '✅' : '❌'}
                </div>
                <div className="result-text">
                  {isCorrect ? getCorrectMessages() : getIncorrectMessages()}
                </div>
                <div className="explanation-text">
                  {currentQuestion.explanation}
                </div>
                {!isCorrect && (
                  <div className="rewind-message">
                    We'll go back to review this concept together! 🔄
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Overlay */}
      {isSummaryActive && currentSummary && (
        <div className="summary-overlay">
          <div className="summary-content">
            <div className="summary-header">
              <div className="summary-icon">{currentSummary.emoji}</div>
              <h2 className="summary-title">{currentSummary.title}</h2>
              <button className="close-summary" onClick={closeSummary}>✕</button>
            </div>
            
            <div className="summary-description">
              {currentSummary.description}
            </div>
            
            <div className="summary-facts">
              <h3>Key Points:</h3>
              <ul>
                {currentSummary.keyFacts.map((fact, index) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            </div>
            
            {summaryCheckpoint && (
              <div className="summary-checkpoint">
                Section: {summaryCheckpoint.title}
              </div>
            )}
            
            <div className="summary-actions">
              <button className="summary-button continue" onClick={closeSummary}>
                Continue Learning 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slow Playback Overlay - Only show for 5 seconds */}
      {showOverlay && (
        <div className="slow-playback-overlay">
          <div className="slow-playback-content">
            <div className="slow-playback-header">
              <div className="slow-playback-icon">🐌</div>
              <div className="slow-playback-title">Slow Playback Mode</div>
              <button className="normalize-speed-btn" onClick={normalizeSpeed}>
                Resume Normal Speed
              </button>
            </div>
            
            <div className="slow-playback-info">
              <div className="speed-indicator">
                <span className="speed-label">Speed:</span>
                <span className="speed-value">0.75x</span>
              </div>
              
              {slowPlaybackCheckpoint && (
                <div className="slow-playback-checkpoint">
                  <span className="checkpoint-label">Section:</span>
                  <span className="checkpoint-name">{slowPlaybackCheckpoint.title}</span>
                </div>
              )}
              
              <div className="slow-playback-message">
                Speed will return to normal at the next checkpoint! 🎯
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Countdown Overlays */}
      <CountdownOverlay 
        isActive={showQuestionCountdown} 
        onComplete={handleQuestionCountdownComplete}
      />
      
      <CountdownOverlay 
        isActive={showSummaryCountdown} 
        onComplete={handleSummaryCountdownComplete}
      />
    </div>
  );
};

export default LearningVideo;

