import { Routes, Route, useNavigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LearningPage from './pages/LearningPage';
import WebcamPreview from './pages/WebcamPreview';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/preview" element={<WebcamPreview />} />
      <Route path="/session" element={<LearningPage />} /> 
    </Routes>
  );
};

export default App;