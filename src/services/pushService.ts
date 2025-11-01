// Push Notification Service
// Handles registration, subscription, and permission requests for push notifications

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      console.log('[PushService] Service Worker ready');
    } catch (error) {
      console.error('[PushService] Service Worker registration failed:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('[PushService] Service Worker registration not available');
      return null;
    }

    try {
      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('[PushService] Already subscribed:', this.subscription.endpoint);
        return this.subscription;
      }

      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('[PushService] Notification permission not granted');
        return null;
      }

      // Create new subscription
      // Note: In production, you would use VAPID public key from your backend
      // For now, we'll create a subscription without VAPID (works for localhost)
      try {
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('[PushService] Subscribed to push notifications:', this.subscription.endpoint);
        
        // Send subscription to backend (if you have one)
        // await this.sendSubscriptionToBackend(this.subscription);
        
        return this.subscription;
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          console.warn('[PushService] Push subscription not allowed');
        } else {
          console.error('[PushService] Push subscription failed:', error);
        }
        return null;
      }
    } catch (error) {
      console.error('[PushService] Subscription error:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      const result = await this.subscription.unsubscribe();
      if (result) {
        console.log('[PushService] Unsubscribed from push notifications');
        this.subscription = null;
      }
      return result;
    } catch (error) {
      console.error('[PushService] Unsubscribe error:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    try {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('[PushService] Get subscription error:', error);
      return null;
    }
  }

  async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    // This method should send the subscription to your backend
    // Backend will use it to send push notifications
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(
          subscription.getKey('p256dh') || new ArrayBuffer(0)
        ),
        auth: this.arrayBufferToBase64(
          subscription.getKey('auth') || new ArrayBuffer(0)
        ),
      },
    };

    console.log('[PushService] Subscription data:', subscriptionData);
    
    // Example: Send to backend
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscriptionData),
    // });
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Send a local notification (for testing)
  async sendLocalNotification(title: string, options: NotificationOptions): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('[PushService] Cannot send notification: permission not granted');
      return;
    }

    if (!this.registration) {
      await this.initialize();
    }

    if (this.registration) {
      this.registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }
}

// Export singleton instance
export const pushService = new PushService();

// Helper function to convert VAPID key (if needed)
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

