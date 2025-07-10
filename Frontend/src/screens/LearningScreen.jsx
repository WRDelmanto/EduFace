import { useState, useEffect } from 'react';
import WebcamMessagingPanel from '../components/LearningScreenComponents/WebcamMessagingPanel';
import VideoPanel from '../components/LearningScreenComponents/VideoPanel';
import useWebcamSocket from '../components/LearningScreenComponents/useWebcamSocket';
import handleConfusion from '../services/microadaptation/handleConfusion';
import handleEngaged from '../services/microadaptation/handleEngaged';
import handleLearningState from '../services/microadaptation';
import '../css/LearningScreen.css';

function LearningScreen() {
  const [videoStarted, setVideoStarted] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastLearningState, setLastLearningState] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(0);
  const [frustrationActive, setFrustrationActive] = useState(false);
  const [lastTriggeredTime, setLastTriggeredTime] = useState({});
  const COOLDOWN_MS = 20000; // 20 seconds cooldown per emotion

  const {
    videoRef,
    canvasRef,
    minimized,
    toggleMinimized,
    latestResponse,
  } = useWebcamSocket(videoStarted);

  const effectiveResponse = simulatedResponse;

  const handleUserResponse = (value, id) => {
    if (value === 'rewind' && videoRef.current) {
      const video = videoRef.current;
      video.currentTime = Math.max(0, video.currentTime - 15);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: "🔁 Rewound 15 seconds.", type: "system" },
      ]);
    }

    // Mark the bubble as responded without reordering
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, responded: true } : msg
      )
    );
  };

  useEffect(() => {
    const state = effectiveResponse?.learning_state;
    if (state) {
      const now = Date.now();
      const lastTime = lastTriggeredTime[state] || 0;
      const cooldownPassed = now - lastTime > COOLDOWN_MS;

      if (
          cooldownPassed &&
          state !== lastLearningState &&
          (!frustrationActive || state !== 'frustrated')
        ) {
        // Additional cooldown buffer for 'frustrated'
        if (state === 'frustrated') {
          const frustrationBufferMs = 10000; // e.g., 10-second buffer after frustration ends
          const frustrationLastTime = lastTriggeredTime['frustrated'] || 0;
          if (now - frustrationLastTime < COOLDOWN_MS + frustrationBufferMs) {
            return; // too soon to trigger frustration again
          }
        }
        handleLearningState(
          state,
          videoRef,
          setMessages,
          handleUserResponse,
          setFrustrationActive,
          pauseDuration,
          setShowOverlay
        );
        setLastLearningState(state);
        if (state === 'frustrated') {
          setFrustrationActive(true);
        }
        setLastTriggeredTime((prev) => ({ ...prev, [state]: now }));
      }
      // 👇 Reset simulated state regardless
      setSimulatedResponse(null);
    }
  }, [effectiveResponse?.learning_state]);

  return (
    <div className="learning-wrapper">
      <WebcamMessagingPanel
        videoRef={videoRef}
        minimized={minimized}
        toggleMinimized={toggleMinimized}
        messages={messages}
        onResponse={handleUserResponse}
        mostRecentMessageId={messages[messages.length - 1]?.id}
      />

      <VideoPanel
        videoStarted={videoStarted}
        onStart={() => setVideoStarted(true)}
        latestResponse={effectiveResponse}
        videoRef={videoRef}
        setMessages={setMessages}
        onUserResponse={handleUserResponse}
        onResume={() => setSimulatedResponse({ learning_state: 'engaged' })}
        showOverlay={showOverlay}
        pauseDuration={pauseDuration}
      />

      {/* Debug Buttons */}
      <div className="debug-panel">
        <button onClick={() => setSimulatedResponse({ learning_state: 'confused' })}>
          Simulate Confused
        </button>
        <button onClick={() => setSimulatedResponse({ learning_state: 'frustrated' })}>
          Simulate Frustrated
        </button>
        <button onClick={() => setSimulatedResponse({ learning_state: 'disengaged' })}>
          Simulate Disengaged
        </button>
        <button onClick={() => setSimulatedResponse({ learning_state: 'engaged' })}>
          Simulate Engaged
        </button>
        <button onClick={() => setSimulatedResponse(null)}>Clear Simulated State</button>
      </div>

      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />
    </div>
  );
}

export default LearningScreen;