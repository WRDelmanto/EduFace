export default function handleConfusion(videoRef) {
  if (!videoRef?.current) return;

  const video = videoRef.current;
  const rewindSeconds = 5;

  if (video.currentTime > rewindSeconds) {
    video.currentTime -= rewindSeconds;
    console.log('🔁 Rewinding video 5 seconds due to confusion');
  } else {
    video.currentTime = 0;
    console.log('🔁 Rewinding to start due to confusion');
  }
}