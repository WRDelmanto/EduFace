import { useState } from 'react';
import WebcamMessagingPanel from '../components/LearningScreenComponents/WebcamMessagingPanel';
import VideoPanel from '../components/LearningScreenComponents/VideoPanel';
import useWebcamSocket from '../components/LearningScreenComponents/useWebcamSocket';
import '../css/LearningScreen.css';

function LearningScreen() {
  const [videoStarted, setVideoStarted] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState(null);

  const {
    videoRef,
    canvasRef,
    minimized,
    toggleMinimized,
    latestResponse,
  } = useWebcamSocket(videoStarted);

  const effectiveResponse = simulatedResponse || latestResponse;

  return (
    <div className="learning-wrapper">
      <WebcamMessagingPanel
        videoRef={videoRef}
        minimized={minimized}
        toggleMinimized={toggleMinimized}
      />

      <VideoPanel
        videoStarted={videoStarted}
        onStart={() => setVideoStarted(true)}
        latestResponse={effectiveResponse}
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