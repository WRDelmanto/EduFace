import { v4 as uuidv4 } from 'uuid';
let lastFrustrationTime = 0;
const COOLDOWN_DURATION_MS = 30000; // 30 seconds cooldown

export default function handleFrustration(videoRef, setMessages, onComplete) {
  console.log('🔴 Frustration detected — initiating 15-second pause.');
  const now = Date.now();
  if (now - lastFrustrationTime < COOLDOWN_DURATION_MS) {
    console.log('⏳ Skipping frustration trigger — still in cooldown.');
    return;
  }
  
lastFrustrationTime = now;

  const video = videoRef.current;
  if (!video) return;

  // Pause video
  video.pause();

  // Show frustration message bubble
  setMessages((prev) => [
    {
      id: uuidv4(),
      text: "😟 You seem a bit frustrated. Let's take a 15-second break 😊",
      type: 'system',
    },
    ...prev,
  ]);

  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'frustration-overlay';
  overlay.innerHTML = `
    <div class="frustration-timer-wrapper">
      <div class="pause-icon">⏸</div>
      <div class="break-message">Let's take a quick 15-second break 😊</div>
      <div class="timer-text" id="frustration-timer">15</div>
    </div>
  `;

  // Append overlay to the video container
  const videoContainer = document.querySelector('.main-video');
  if (videoContainer) videoContainer.appendChild(overlay);

  // Start countdown
  let remaining = 15;
  const interval = setInterval(() => {
    remaining--;
    const timerEl = document.getElementById('frustration-timer');
    if (timerEl) timerEl.textContent = remaining.toString();
    if (remaining <= 0) {
      clearInterval(interval);
      video.play();
      const timerEl = document.getElementById('frustration-timer');
      if (timerEl) timerEl.remove(); // explicitly remove lingering timer text
      overlay.remove();
      if (typeof onComplete === 'function') {
        onComplete(); // Reset frustrationActive flag
      }
    }
  }, 1000);
}