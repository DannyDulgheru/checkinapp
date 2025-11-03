import { useState, useEffect, useRef } from 'react';
import { getActiveCheckIn, saveActiveCheckIn, ActiveCheckInState } from '../services/storageService';

interface UseFirebaseTimerReturn {
  seconds: number;
  isRunning: boolean;
  isCheckedIn: boolean;
  startCheckIn: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  checkOut: () => void;
}

export const useFirebaseTimer = (userId: string): UseFirebaseTimerReturn => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from Firebase once on mount (no real-time subscription)
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadState = async () => {
      try {
        // Load initial state only once
        const savedState = await getActiveCheckIn(userId);
        if (savedState && savedState.startTime) {
          const savedStartTime = new Date(savedState.startTime);
          const now = new Date();
          
          setIsCheckedIn(true);
          setStartTime(savedStartTime);
          setPausedDuration(0); // Reset paused duration, will calculate from pause/resume locally
          
          if (savedState.isPaused) {
            // If paused, we don't know when it was paused, so show elapsed time when loaded
            // User will resume and we'll calculate pause duration then
            setIsRunning(false);
            setPausedAt(null); // We don't store pausedAt in Firebase anymore
            // Calculate elapsed time from start to now
            const elapsed = Math.floor((now.getTime() - savedStartTime.getTime()) / 1000);
            setSeconds(Math.max(0, elapsed));
          } else {
            // If running, calculate current elapsed time locally
            const elapsed = Math.floor((now.getTime() - savedStartTime.getTime()) / 1000);
            setSeconds(Math.max(0, elapsed));
            setIsRunning(true);
            setPausedAt(null);
          }
        }
      } catch (error) {
        console.error('Error loading state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [userId]);

  // Update timer when running (calculate locally, no Firebase writes)
  useEffect(() => {
    if (isRunning && startTime && !isLoading) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedDuration;
        setSeconds(Math.max(0, elapsed));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, pausedDuration, isLoading]);

  // Save to Firebase ONLY on user actions, not continuously
  const startCheckIn = () => {
    if (!userId) return;
    
    const now = new Date();
    setStartTime(now);
    setIsCheckedIn(true);
    setIsRunning(true);
    setPausedDuration(0);
    setPausedAt(null);
    setSeconds(0);
    
    // Save to Firebase only when check-in starts
    const state: ActiveCheckInState = {
      startTime: now.toISOString(),
      isPaused: false,
    };
    saveActiveCheckIn(userId, state).catch(error => {
      console.error('Error saving check-in start:', error);
    });
  };

  const pause = () => {
    if (!userId || !isRunning || !startTime) return;
    
    const now = new Date();
    setIsRunning(false);
    setPausedAt(now);
    
    // Save pause state to Firebase
    const state: ActiveCheckInState = {
      startTime: startTime.toISOString(),
      isPaused: true,
    };
    saveActiveCheckIn(userId, state).catch(error => {
      console.error('Error saving pause:', error);
    });
  };

  const resume = () => {
    if (!userId || isRunning || !startTime || !pausedAt) return;
    
    const now = new Date();
    // Calculate pause duration locally
    const pauseDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
    setPausedDuration((prev) => prev + pauseDuration);
    setPausedAt(null);
    setIsRunning(true);
    
    // Save resume state to Firebase
    const state: ActiveCheckInState = {
      startTime: startTime.toISOString(),
      isPaused: false,
    };
    saveActiveCheckIn(userId, state).catch(error => {
      console.error('Error saving resume:', error);
    });
  };

  const reset = () => {
    if (!userId) return;
    
    setSeconds(0);
    setIsRunning(false);
    setIsCheckedIn(false);
    setStartTime(null);
    setPausedDuration(0);
    setPausedAt(null);
    
    // Clear timer from Firebase
    saveActiveCheckIn(userId, null).catch(error => {
      console.error('Error clearing timer:', error);
    });
  };

  const checkOut = () => {
    // checkOut will be handled by CheckInScreen which saves to history
    // Here we just reset the local state
    reset();
  };

  return {
    seconds,
    isRunning,
    isCheckedIn,
    startCheckIn,
    pause,
    resume,
    reset,
    checkOut,
  };
};
