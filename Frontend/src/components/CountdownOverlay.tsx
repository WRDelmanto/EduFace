import React, { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  onComplete: () => void;
  isActive?: boolean;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete, isActive = true }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    // Only start countdown if isActive is true
    if (!isActive) {
      setCount(3); // Reset count when not active
      return;
    }

    // Reset count when becoming active
    setCount(3);

    const countdown = setInterval(() => {
      setCount(prevCount => {
        if (prevCount <= 1) {
          clearInterval(countdown);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isActive]); // Remove onComplete from dependencies to prevent infinite re-renders

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        <div className="countdown-circle">
          <div className="countdown-number">{count > 0 ? count : "▶️"}</div>
        </div>
        <div className="countdown-text">
          {count > 0 ? "Let's Start Learning!" : "Let's go!"}
        </div>
      </div>
    </div>
  );
};

export default CountdownOverlay;