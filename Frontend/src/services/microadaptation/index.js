import handleConfusion from './handleConfusion';
import handleFrustration from './handleFrustration';
import handleDisengaged from './handleDisengaged';
import handleUncertain from './handleUncertain';

export default function handleLearningState(state, videoRef) {
  switch (state) {
    case 'confused':
      handleConfusion(videoRef);
      break;
    case 'frustrated':
      handleFrustration(videoRef);
      break;
    case 'disengaged':
      handleDisengaged(videoRef);
      break;
    case 'uncertain':
      handleUncertain(videoRef);
      break;
    default:
      console.log(`ℹ️ No adaptation for: ${state}`);
  }
}