export function mapEmotionToLearningState(emotion: string): string {
  switch (emotion.toLowerCase()) {
    case 'happy':
      return 'engagement';
    case 'neutral':
    case 'disgust':
      return 'disengagement';
    case 'sad':
    case 'fear':
    case 'surprise':
      return 'confusion';
    case 'angry':
      return 'frustration';
    default:
      return 'engagement';
  }
}