// Service for scheduling notifications using Web Notifications API

// Check if notifications are supported
const isSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

let notificationTimeouts: Map<string, number> = new Map();

export const scheduleNotification = async (
  checkInId: string,
  startTime: string,
  targetSeconds: number = 32400 // 9 hours default
): Promise<void> => {
  try {
    if (!isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    // Request permissions
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Calculate when to show notification (startTime + targetSeconds)
    const startTimestamp = new Date(startTime).getTime();
    const targetTimestamp = startTimestamp + targetSeconds * 1000;
    const now = Date.now();
    const delay = targetTimestamp - now;

    // Only schedule if in the future
    if (delay > 0) {
      const hours = Math.floor(targetSeconds / 3600);
      const timeoutId = window.setTimeout(() => {
        new Notification(`${hours} ${hours === 1 ? 'oră' : 'ore'} atinse!`, {
          body: `Ai făcut ${hours} ${hours === 1 ? 'oră' : 'ore'} de check-in!`,
          icon: '/icons/icon.png',
          tag: checkInId,
        });
        notificationTimeouts.delete(checkInId);
      }, delay);

      notificationTimeouts.set(checkInId, timeoutId);
      console.log('[NotificationService] Scheduled notification:', {
        checkInId,
        startTime,
        targetSeconds,
        timeoutId,
      });
    }
  } catch (error) {
    console.error('[NotificationService] Failed to schedule notification:', error);
  }
};

export const cancelScheduledNotification = async (checkInId: string): Promise<void> => {
  try {
    const timeoutId = notificationTimeouts.get(checkInId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      notificationTimeouts.delete(checkInId);
      console.log('[NotificationService] Cancelled notification:', checkInId);
    }
  } catch (error) {
    console.error('[NotificationService] Failed to cancel notification:', error);
  }
};

export const scheduleRecurringNotifications = async (
  checkInId: string,
  startTime: string,
  targetHours: number = 32400
): Promise<void> => {
  try {
    if (!isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const startTimestamp = new Date(startTime).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTimestamp) / 1000);
    
    // Only schedule recurring if past target hours
    if (elapsed >= targetHours) {
      // Calculate minutes since target hours
      const minutesSinceTarget = Math.floor((elapsed - targetHours) / 60);
      // Schedule next notification at the next 5-minute mark
      const nextNotificationMinutes = (Math.floor(minutesSinceTarget / 5) + 1) * 5;
      const nextNotificationSeconds = targetHours + (nextNotificationMinutes * 60);
      const delay = (nextNotificationSeconds - elapsed) * 1000;

      if (delay > 0 && delay <= 3600000) { // Only schedule if within 1 hour
        const timeoutId = window.setTimeout(() => {
          const formattedTime = formatTime(nextNotificationSeconds);
          new Notification('Done Work', {
            body: `Ai făcut ${formattedTime} de check-in!`,
            icon: '/icons/icon.png',
            tag: `${checkInId}-recurring`,
          });
          notificationTimeouts.delete(`${checkInId}-recurring`);
        }, delay);

        notificationTimeouts.set(`${checkInId}-recurring`, timeoutId);
        console.log('[NotificationService] Scheduled recurring notification:', {
          checkInId,
          startTime,
          timeoutId,
          delay,
        });
      }
    }
  } catch (error) {
    console.error('[NotificationService] Failed to schedule recurring notifications:', error);
  }
};

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
