import { Routes, Route, useNavigate } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import LearningScreen from './screens/LearningScreen';
import WebcamPreview from './screens/WebcamPreview';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/preview" element={<WebcamPreview/>} />
      <Route path="/session" element={<LearningScreen />} />
    </Routes>
  );
};

export default App;

