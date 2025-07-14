import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomePage.css';

function WelcomePage() {
  
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  

  const handleStart = () => {
    if (agreed) {
      navigate('/preview');
    }
  };

  return (
    <div className="welcome-wrapper">
      <header className="welcome-header">
        Digital Learning Study
      </header>

      <div className="welcome-content">
        <main className="welcome-card">
          <h2 className="welcome-title">Welcome to our digital learning study!</h2>

          <div className="scroll-content">
            <p>
              Thank you for participating. In this study, we’re exploring how individuals interact with online educational materials in different conditions.
            </p>
            <p>
              Your webcam will remain active during the session to help us observe general engagement and behavior patterns. No audio will be recorded.
            </p>
            <p>
              The data collected will be securely stored and anonymized before analysis. All information is used solely for research purposes and handled with strict confidentiality.
            </p>
            <p>
              Participation is completely voluntary, and you may withdraw at any time without any penalty.
            </p>
            <p>
              If you agree to participate, please check the box below and click "Start Session" to continue.
            </p>
          </div>

          <div className="consent-section">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              &nbsp; I have read the information above and consent to participate.
            </label>
          </div>

          <button
            className="start-button"
            onClick={handleStart}
            disabled={!agreed}
          >
            Start Session
          </button>
        </main>
      </div>
    </div>
  );
}

export default WelcomePage;