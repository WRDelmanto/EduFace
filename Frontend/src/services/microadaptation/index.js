import handleConfusion from './handleConfusion';
import handleEngaged from './handleEngaged';
import handleFrustration from './handleFrustration';
import handleDisengaged from './handleDisengaged';

export default function handleLearningState(
  state,
  videoRef,
  setMessages,
  onUserResponse,
  frustrationActive,
  setFrustrationActive // 👈 pass this from LearningScreen.jsx
) {
  switch (state) {
    case 'confused':
      handleConfusion(videoRef, setMessages, onUserResponse);
      break;
    case 'engaged':
      handleEngaged(setMessages);
      break;
    case 'disengaged':
      handleDisengaged(videoRef, setMessages);
      break;
    case 'frustrated':
      if (!frustrationActive) {
        if (setFrustrationActive) setFrustrationActive(true);

        handleFrustration(videoRef, setMessages, () => {
          if (setFrustrationActive) setFrustrationActive(false); // optional external reset
        });
      }
      break;
    default:
      break;
  }
}