
import { useEffect, useRef } from 'react';

export const useIdleTimer = (onIdle: () => void, timeout: number) => {
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Set up event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [onIdle, timeout]);
};
