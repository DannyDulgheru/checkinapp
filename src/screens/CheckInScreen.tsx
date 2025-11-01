import React, { useState, useEffect, useRef } from 'react';
import { usePersistentTimer } from '../hooks/usePersistentTimer';
import { saveCheckIn, clearActiveCheckIn, getActiveCheckIn } from '../services/storageService';
import { CheckInRecord } from '../types/checkIn';
import { pushService } from '../services/pushService';
import { scheduleNotification, cancelScheduledNotification, scheduleRecurringNotifications } from '../services/notificationService';
import '../styles/CheckInScreen.css';

export default function CheckInScreen() {
  const {
    seconds,
    isRunning,
    isCheckedIn,
    startCheckIn,
    pause,
    resume,
    reset,
    checkOut,
  } = usePersistentTimer();
  const [checkInStartTime, setCheckInStartTime] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const checkInIdRef = useRef<string | null>(null);
  const lastRecurringNotificationRef = useRef<number>(0);

  useEffect(() => {
    // Initialize push service
    pushService.initialize();
    // Subscribe to push notifications
    pushService.subscribe();

    // Listen for messages from Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'REQUEST_CHECKIN_STATE') {
          // Send current check-in state to Service Worker
          const state = getActiveCheckIn();
          if (state && checkInIdRef.current) {
            scheduleNotification(checkInIdRef.current, state.startTime, 120);
          }
        }
      });
    }
  }, []);

  // Update checkInStartTime when isCheckedIn changes
  useEffect(() => {
    if (isCheckedIn) {
      const savedState = getActiveCheckIn();
      if (savedState) {
        setCheckInStartTime(savedState.startTime);
        
        // Re-schedule notification if check-in was restored from storage
        if (!checkInIdRef.current) {
          checkInIdRef.current = `checkin-${Date.now()}`;
          const startTimestamp = new Date(savedState.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTimestamp) / 1000) - (savedState.pausedDuration || 0);
          
          // Only schedule if we haven't reached 9 hours yet
          if (elapsed < 32400) {
            scheduleNotification(checkInIdRef.current, savedState.startTime, 32400);
            console.log('[CheckInScreen] Restored check-in, scheduled notification for 9 hours');
          } else {
            // If past 9 hours, start recurring notifications immediately
            scheduleRecurringNotifications(checkInIdRef.current, savedState.startTime);
            // Mark 9 hours notification as sent
            setNotificationSent(true);
            // Set last recurring notification to avoid duplicate
            const minutesSince9Hours = Math.floor((elapsed - 32400) / 60);
            lastRecurringNotificationRef.current = 32400 + (Math.floor(minutesSince9Hours / 5) * 5 * 60);
          }
        }
      }
    } else {
      setCheckInStartTime(null);
      checkInIdRef.current = null;
    }
  }, [isCheckedIn]);

  // Monitor timer for 9 hours notification and recurring notifications (fallback when app is open)
  useEffect(() => {
    if (isCheckedIn) {
      // First notification at 9 hours
      if (seconds >= 32400 && !notificationSent) {
        // Send notification when reaching 9 hours (only if app is open)
        pushService.sendLocalNotification('9 ore atinse!', {
          body: 'Ai făcut 9 ore de check-in!',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: '9hours',
          data: {
            url: '/',
          },
        });
        setNotificationSent(true);
        console.log('Notificare trimisă la 9 ore (app open):', seconds);
        
        // Start recurring notifications
        if (checkInIdRef.current && checkInStartTime) {
          scheduleRecurringNotifications(checkInIdRef.current, checkInStartTime);
          lastRecurringNotificationRef.current = seconds;
        }
      }
      
      // Recurring notifications every 5 minutes after 9 hours
      if (seconds >= 32400 && seconds > lastRecurringNotificationRef.current) {
        const minutesSince9Hours = Math.floor((seconds - 32400) / 60);
        // Send notification every 5 minutes
        if (minutesSince9Hours > 0 && minutesSince9Hours % 5 === 0) {
          const lastNotificationMinutes = Math.floor((lastRecurringNotificationRef.current - 32400) / 60);
          // Only send if this is a new 5-minute mark
          if (lastNotificationMinutes < minutesSince9Hours) {
            pushService.sendLocalNotification('Done Work', {
              body: 'Ai făcut ' + formatTime(seconds) + ' de check-in!',
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-192.png',
              tag: 'done-work-' + minutesSince9Hours,
              data: {
                url: '/',
              },
            });
            lastRecurringNotificationRef.current = seconds;
            console.log('Notificare recurentă "Done Work" (app open):', seconds);
          }
        }
      }
    }
  }, [seconds, isCheckedIn, notificationSent, checkInStartTime]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCheckIn = () => {
    startCheckIn();
    const startTime = new Date().toISOString();
    setCheckInStartTime(startTime);
    setNotificationSent(false);
    
    // Generate unique check-in ID
    checkInIdRef.current = `checkin-${Date.now()}`;
    
    // Schedule notification in Service Worker for background notifications (9 hours)
    scheduleNotification(checkInIdRef.current, startTime, 32400); // 9 hours = 32400 seconds
    console.log('[CheckInScreen] Scheduled notification for 9 hours');
  };

  const handleCheckOut = async () => {
    if (!isCheckedIn || !checkInStartTime) {
      window.alert('Trebuie să faci check-in mai întâi!');
      return;
    }

    try {
      const endTime = new Date().toISOString();
      const record: CheckInRecord = {
        id: Date.now().toString(),
        startTime: checkInStartTime,
        endTime: endTime,
        duration: seconds,
        status: 'checked-out',
      };

      await saveCheckIn(record);
      
      window.alert('Check-out realizat cu succes!');
      
      // Send push notification
      await pushService.sendLocalNotification('Check-out realizat!', {
        body: `Durată: ${formatTime(seconds)}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'checkout',
        data: {
          url: '/',
        },
      });
      
      // Cancel scheduled notification
      if (checkInIdRef.current) {
        cancelScheduledNotification(checkInIdRef.current);
        checkInIdRef.current = null;
      }
      
      // Clear saved state and reset
      clearActiveCheckIn();
      setNotificationSent(false);
      lastRecurringNotificationRef.current = 0;
      checkOut();
    } catch (error) {
      window.alert('Nu s-a putut salva check-out-ul');
      console.error(error);
    }
  };

  return (
    <div className="checkin-container">
      <div className="timer-container">
        <span className="timer-text">{formatTime(seconds)}</span>
      </div>

      <div className="button-container">
        {!isCheckedIn ? (
          <button
            className="button check-in-button"
            onClick={handleCheckIn}
          >
            Check-in
          </button>
        ) : (
          <>
            {!isRunning ? (
              <button
                className="button start-button"
                onClick={resume}
              >
                Reia
              </button>
            ) : (
              <button
                className="button stop-button"
                onClick={pause}
              >
                Pause
              </button>
            )}

            <button
              className="button check-out-button"
              onClick={handleCheckOut}
            >
              Check-out
            </button>
          </>
        )}
      </div>

      {isCheckedIn && checkInStartTime && (
        <div className="status-container">
          <p className="status-text">
            Status: Check-in efectuat la {new Date(checkInStartTime).toLocaleString('ro-RO')}
          </p>
          <p className="status-text">
            Check-out estimat: {(() => {
              const startTime = new Date(checkInStartTime);
              const estimatedCheckOut = new Date(startTime.getTime() + 32400 * 1000); // 9 hours = 32400 seconds
              return estimatedCheckOut.toLocaleString('ro-RO');
            })()}
          </p>
        </div>
      )}
    </div>
  );
}
