// Service for scheduling notifications through Service Worker

export const scheduleNotification = async (
  checkInId: string,
  startTime: string,
  targetSeconds: number = 32400 // 9 hours default
): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    registration.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      checkInId,
      startTime,
      targetSeconds,
    });
    
    console.log('[NotificationService] Scheduled notification:', {
      checkInId,
      startTime,
      targetSeconds,
    });
  } catch (error) {
    console.error('[NotificationService] Failed to schedule notification:', error);
  }
};

export const cancelScheduledNotification = async (checkInId: string): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    registration.active?.postMessage({
      type: 'CANCEL_NOTIFICATION',
      id: checkInId,
    });
    
    console.log('[NotificationService] Cancelled notification:', checkInId);
  } catch (error) {
    console.error('[NotificationService] Failed to cancel notification:', error);
  }
};

export const scheduleRecurringNotifications = async (
  checkInId: string,
  startTime: string
): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    registration.active?.postMessage({
      type: 'SCHEDULE_RECURRING_NOTIFICATIONS',
      checkInId,
      startTime,
    });
    
    console.log('[NotificationService] Scheduled recurring notifications:', {
      checkInId,
      startTime,
    });
  } catch (error) {
    console.error('[NotificationService] Failed to schedule recurring notifications:', error);
  }
};

