// Push Notification Service for Web
// Handles notifications using Web Notifications API

class PushService {
  async initialize(): Promise<void> {
    try {
      // Request permissions
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('[PushService] Notification permissions granted');
        } else {
          console.warn('[PushService] Notification permissions not granted');
        }
      }
    } catch (error) {
      console.error('[PushService] Initialization failed:', error);
    }
  }

  async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    try {
      if (!('Notification' in window)) {
        return 'denied';
      }
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('[PushService] Permission request failed:', error);
      return 'denied';
    }
  }

  async sendLocalNotification(title: string, options: {
    body?: string;
    data?: any;
  }): Promise<void> {
    try {
      if (!('Notification' in window)) {
        console.warn('[PushService] Notifications not supported');
        return;
      }

      const permission = Notification.permission;
      if (permission !== 'granted') {
        console.warn('[PushService] Cannot send notification: permission not granted');
        return;
      }

      new Notification(title, {
        body: options.body || '',
        icon: '/icons/icon.png',
        data: options.data || {},
      });
    } catch (error) {
      console.error('[PushService] Failed to send notification:', error);
    }
  }
}

// Export singleton instance
export const pushService = new PushService();
