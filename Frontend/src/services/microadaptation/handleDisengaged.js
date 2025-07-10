export default function handleDisengaged(videoRef) {
  if (videoRef.current) {
    videoRef.current.pause();
  }
  console.log('🟡 Disengaged — video paused.');
}