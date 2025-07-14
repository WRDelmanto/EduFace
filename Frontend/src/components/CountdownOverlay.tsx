import React, { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  isActive: boolean;
  onComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ isActive, onComplete }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!isActive) return;

    setCount(3);
    
    const countdown = setInterval(() => {
      setCount(prevCount => {
        if (prevCount <= 1) {
          clearInterval(countdown);
          setTimeout(onComplete, 500); // Small delay after "1" before resuming
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        <div className="countdown-circle">
          <div className="countdown-number">{count > 0 ? count : "▶️"}</div>
        </div>
        <div className="countdown-text">
          {count > 0 ? "Get ready to continue learning!" : "Let's go!"}
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;