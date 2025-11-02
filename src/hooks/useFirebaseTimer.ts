import { useState, useEffect, useRef } from 'react';
import { getActiveCheckIn, saveActiveCheckIn, subscribeToData, ActiveCheckInState } from '../services/storageService';
import type { Unsubscribe } from 'firebase/firestore';

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
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Load state from Firebase on mount and subscribe to real-time updates
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadAndSubscribe = async () => {
      try {
        // Load initial state
        const savedState = await getActiveCheckIn(userId);
        if (savedState) {
          const savedStartTime = new Date(savedState.startTime);
          const now = new Date();
          
          setIsCheckedIn(true);
          setStartTime(savedStartTime);
          setPausedDuration(savedState.pausedDuration || 0);

          if (savedState.isPaused && savedState.pausedAt) {
            // If paused, calculate elapsed time up to pause point
            const pauseTime = new Date(savedState.pausedAt);
            const elapsed = Math.floor((pauseTime.getTime() - savedStartTime.getTime()) / 1000) - savedState.pausedDuration;
            setSeconds(elapsed);
            setIsRunning(false);
            setPausedAt(pauseTime);
          } else {
            // If running, calculate current elapsed time
            const elapsed = Math.floor((now.getTime() - savedStartTime.getTime()) / 1000) - savedState.pausedDuration;
            setSeconds(Math.max(0, elapsed));
            setIsRunning(true);
          }
        }

        // Subscribe to real-time updates from Firebase
        const unsubscribe = subscribeToData(userId, (data) => {
          if (data?.activeCheckIn) {
            const savedState = data.activeCheckIn;
            const savedStartTime = new Date(savedState.startTime);
            const now = new Date();
            
            setIsCheckedIn(true);
            setStartTime(savedStartTime);
            setPausedDuration(savedState.pausedDuration || 0);

            if (savedState.isPaused && savedState.pausedAt) {
              const pauseTime = new Date(savedState.pausedAt);
              const elapsed = Math.floor((pauseTime.getTime() - savedStartTime.getTime()) / 1000) - savedState.pausedDuration;
              setSeconds(elapsed);
              setIsRunning(false);
              setPausedAt(pauseTime);
            } else {
              const elapsed = Math.floor((now.getTime() - savedStartTime.getTime()) / 1000) - savedState.pausedDuration;
              setSeconds(Math.max(0, elapsed));
              setIsRunning(true);
              setPausedAt(null);
            }
          } else {
            // No active check-in
            setIsCheckedIn(false);
            setIsRunning(false);
            setStartTime(null);
            setPausedDuration(0);
            setPausedAt(null);
            setSeconds(0);
          }
        });

        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error('Error loading state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndSubscribe();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  // Update timer when running
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

  // Save state to Firebase whenever it changes
  useEffect(() => {
    if (!isLoading && isCheckedIn && startTime && userId) {
      const state: ActiveCheckInState = {
        startTime: startTime.toISOString(),
        pausedAt: pausedAt?.toISOString() || null,
        pausedDuration: pausedDuration,
        isPaused: !isRunning,
      };
      saveActiveCheckIn(userId, state);
    }
  }, [isCheckedIn, startTime, pausedAt, pausedDuration, isRunning, isLoading, userId]);

  const startCheckIn = () => {
    if (!userId) return;
    
    const now = new Date();
    setStartTime(now);
    setIsCheckedIn(true);
    setIsRunning(true);
    setPausedDuration(0);
    setPausedAt(null);
    setSeconds(0);
  };

  const pause = () => {
    if (!userId || !isRunning || !startTime) return;
    
    const now = new Date();
    setIsRunning(false);
    setPausedAt(now);
  };

  const resume = () => {
    if (!userId || isRunning || !startTime || !pausedAt) return;
    
    const now = new Date();
    const pauseDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
    setPausedDuration((prev) => prev + pauseDuration);
    setPausedAt(null);
    setIsRunning(true);
  };

  const reset = () => {
    if (!userId) return;
    
    setSeconds(0);
    setIsRunning(false);
    setIsCheckedIn(false);
    setStartTime(null);
    setPausedDuration(0);
    setPausedAt(null);
  };

  const checkOut = () => {
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

