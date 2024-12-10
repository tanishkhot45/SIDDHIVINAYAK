// src/components/Notification/Notification.tsx

import React, { useEffect, useState } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'error';
  onClose: () => void;
  duration?: number; // Duration in milliseconds (optional)
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration = 5000, // Default to 5 seconds
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timer to start the hide animation after 'duration' milliseconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [duration]);

  // After the hide animation ends, call onClose to unmount the component
  const handleAnimationEnd = () => {
    if (!isVisible) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`notification ${type} ${isVisible ? 'slide-in' : 'slide-out'}`}
      role="alert"
      aria-live="assertive"
      onAnimationEnd={handleAnimationEnd}
    >
      <span>{message}</span>
      <button
        className="close-button"
        onClick={handleCloseClick}
        aria-label="Close Notification"
      >
        &times;
      </button>
    </div>
  );
};

export default Notification;
