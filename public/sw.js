const CACHE_NAME = 'checkin-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches (handled below with checkActiveCheckIn)

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Push event - handle push notifications even when app is closed
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  
  let notificationData = {
    title: 'Check-in App',
    body: 'Ai primit o notificare',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'checkin-notification',
    requireInteraction: false,
    data: {
      url: '/',
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Deschide',
        },
        {
          action: 'close',
          title: 'Închide',
        },
      ],
    })
  );
});

// Notification click event - handle when user clicks notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open new window
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event (for offline functionality)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncCheckIns());
  }
});

async function syncCheckIns() {
  // Implement sync logic here if needed
  console.log('[SW] Syncing check-ins...');
}

// Store scheduled notifications
let scheduledNotifications = new Map();
let recurringIntervals = new Map();

// Message event - receive messages from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SCHEDULE_NOTIFICATION':
        scheduleNotification(event.data);
        break;
      case 'SCHEDULE_RECURRING_NOTIFICATIONS':
        scheduleRecurringNotifications(event.data);
        break;
      case 'CANCEL_NOTIFICATION':
        cancelNotification(event.data.id);
        break;
      case 'CHECK_ACTIVE_CHECKIN':
        checkActiveCheckIn();
        break;
    }
  }
});

// Schedule notification for 9 hours after check-in
function scheduleNotification(data) {
  const { checkInId, startTime, targetSeconds } = data;
  const startTimestamp = new Date(startTime).getTime();
  const now = Date.now();
  
  // Calculate when to show notification (9 hours = 32400 seconds after start)
  const notificationTime = startTimestamp + (targetSeconds * 1000);
  const delay = Math.max(0, notificationTime - now);
  
  console.log('[SW] Scheduling notification:', {
    checkInId,
    startTime,
    targetSeconds,
    delay: Math.floor(delay / 1000) + 's',
  });
  
  // Cancel existing notification if any
  if (scheduledNotifications.has(checkInId)) {
    clearTimeout(scheduledNotifications.get(checkInId));
  }
  
  // Schedule notification
  const timeoutId = setTimeout(() => {
    showScheduledNotification(checkInId, '9 ore atinse!', 'Ai făcut 9 ore de check-in!');
    scheduledNotifications.delete(checkInId);
    
    // After 9 hours, start recurring notifications
    scheduleRecurringNotifications({ checkInId, startTime });
  }, delay);
  
  scheduledNotifications.set(checkInId, timeoutId);
  
  // Also set up periodic check for iOS (because setTimeout might not work when app is fully closed)
  startPeriodicCheck(checkInId, startTimestamp, targetSeconds);
}

// Schedule recurring notifications every 5 minutes after 9 hours
function scheduleRecurringNotifications(data) {
  const { checkInId, startTime } = data;
  const startTimestamp = new Date(startTime).getTime();
  
  // Cancel existing recurring notifications if any
  if (recurringIntervals.has(checkInId)) {
    clearInterval(recurringIntervals.get(checkInId));
  }
  
  console.log('[SW] Scheduling recurring notifications for:', checkInId);
  
  // Check every 30 seconds and send notification at 5-minute intervals after 9 hours
  const intervalId = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTimestamp) / 1000);
    
    // Only send if past 9 hours (32400 seconds)
    if (elapsed >= 32400) {
      // Send notification at 5-minute intervals (300 seconds)
      // Check if we're at a 5-minute mark
      const minutesSince9Hours = Math.floor((elapsed - 32400) / 60);
      if (minutesSince9Hours >= 0 && minutesSince9Hours % 5 === 0) {
        const secondsSinceLastCheck = (elapsed - 32400) % 300;
        // Only send if we're very close to a 5-minute mark (within 30 seconds)
        if (secondsSinceLastCheck <= 30) {
          const hours = Math.floor(elapsed / 3600);
          const minutes = Math.floor((elapsed % 3600) / 60);
          const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
          
          showScheduledNotification(
            checkInId + '-recurring-' + minutesSince9Hours,
            'Done Work',
            `Ai făcut ${formattedTime} de check-in!`
          );
        }
      }
    }
  }, 30000); // Check every 30 seconds
  
  recurringIntervals.set(checkInId, intervalId);
}

// Cancel scheduled notification
function cancelNotification(checkInId) {
  if (scheduledNotifications.has(checkInId)) {
    clearTimeout(scheduledNotifications.get(checkInId));
    scheduledNotifications.delete(checkInId);
    console.log('[SW] Cancelled notification:', checkInId);
  }
  
  // Cancel recurring notifications
  if (recurringIntervals.has(checkInId)) {
    clearInterval(recurringIntervals.get(checkInId));
    recurringIntervals.delete(checkInId);
    console.log('[SW] Cancelled recurring notifications:', checkInId);
  }
}

// Show scheduled notification
async function showScheduledNotification(checkInId, title = 'Timp atins!', body = 'Notificare') {
  console.log('[SW] Showing scheduled notification for:', checkInId);
  
  const notificationOptions = {
    title: title,
    body: body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'notification-' + checkInId,
    data: {
      url: '/',
      checkInId: checkInId,
    },
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Deschide',
      },
    ],
  };
  
  await self.registration.showNotification(notificationOptions.title, notificationOptions);
}

// Periodic check for active check-ins (fallback for iOS when app is fully closed)
let periodicCheckInterval = null;

function startPeriodicCheck(checkInId, startTimestamp, targetSeconds) {
  // Clear existing interval if any
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval);
  }
  
  // Check every 60 seconds (less frequent for 9 hours)
  periodicCheckInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - startTimestamp) / 1000);
    
    // If we've reached 9 hours and notification hasn't been shown
    if (elapsed >= targetSeconds && scheduledNotifications.has(checkInId)) {
      console.log('[SW] Periodic check triggered notification at:', elapsed, 'seconds');
      showScheduledNotification(checkInId, '9 ore atinse!', 'Ai făcut 9 ore de check-in!');
      cancelNotification(checkInId);
      
      // Start recurring notifications
      scheduleRecurringNotifications({ checkInId, startTime: new Date(startTimestamp).toISOString() });
    }
    
    // Stop checking after 24 hours
    if (elapsed > 86400) {
      clearInterval(periodicCheckInterval);
      periodicCheckInterval = null;
    }
  }, 60000); // Check every 60 seconds
}

// Check for active check-ins on service worker activation
async function checkActiveCheckIn() {
  // Request check-in state from clients
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients.forEach((client) => {
      client.postMessage({ type: 'REQUEST_CHECKIN_STATE' });
    });
  }
}

// Activate service worker - check for active check-ins
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
      checkActiveCheckIn(),
    ])
  );
});

