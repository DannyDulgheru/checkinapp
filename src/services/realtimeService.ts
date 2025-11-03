import { ref, set, get, onValue, onDisconnect, remove, DatabaseReference, Unsubscribe } from 'firebase/database';
import { realtimeDb, firebaseInitialized } from './firebase';
import { CheckInRecord } from '../types/checkIn';
import { ActiveCheckInState, AppSettings } from './storageService';

// Get database reference helper
const getUserRef = (userId: string, path: string = ''): DatabaseReference | null => {
  if (!realtimeDb || !firebaseInitialized || !userId) {
    console.error('[Realtime] Cannot get ref:', {
      hasRealtimeDb: !!realtimeDb,
      firebaseInitialized,
      hasUserId: !!userId
    });
    return null;
  }
  
  try {
    const dbPath = `users/${userId}${path ? `/${path}` : ''}`;
    console.log('[Realtime] Getting ref for path:', dbPath);
    return ref(realtimeDb, dbPath);
  } catch (error) {
    console.error('[Realtime] Error creating database reference:', error);
    return null;
  }
};

// Timer state management
export const saveActiveCheckInRealtime = async (userId: string, state: ActiveCheckInState | null): Promise<void> => {
  try {
    if (!realtimeDb) {
      console.error('[Realtime] Realtime Database is not initialized. Check Firebase Console to enable Realtime Database.');
      throw new Error('Realtime Database not initialized');
    }

    const timerRef = getUserRef(userId, 'timer');
    if (!timerRef) {
      console.error('[Realtime] Cannot create database reference');
      throw new Error('Cannot create database reference');
    }

    if (state) {
      const data = {
        startTime: state.startTime,
        pausedAt: state.pausedAt,
        pausedDuration: state.pausedDuration,
        isPaused: state.isPaused,
        isCheckedIn: true,
      };
      console.log('[Realtime] Saving active check-in:', data);
      await set(timerRef, data);
    } else {
      console.log('[Realtime] Clearing active check-in');
      await set(timerRef, null);
    }
    console.log('[Realtime] Active check-in saved successfully');
  } catch (error: any) {
    console.error('[Realtime] Error saving active check-in:', error);
    if (error.code === 'PERMISSION_DENIED') {
      console.error('[Realtime] Permission denied! Check Firebase Realtime Database Rules.');
      console.error('[Realtime] Make sure rules allow authenticated users to write to users/{userId}/');
    }
    throw error;
  }
};

export const getActiveCheckInRealtime = async (userId: string): Promise<ActiveCheckInState | null> => {
  try {
    const timerRef = getUserRef(userId, 'timer');
    if (!timerRef) {
      console.error('[Realtime] Database not available');
      return null;
    }

    const snapshot = await get(timerRef);
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.val();
    if (!data || !data.isCheckedIn) {
      return null;
    }

    return {
      startTime: data.startTime,
      pausedAt: data.pausedAt || null,
      pausedDuration: data.pausedDuration || 0,
      isPaused: data.isPaused || false,
    };
  } catch (error) {
    console.error('[Realtime] Error loading active check-in:', error);
    return null;
  }
};

export const subscribeToTimerRealtime = (
  userId: string,
  callback: (state: ActiveCheckInState | null) => void
): Unsubscribe | null => {
  try {
    const timerRef = getUserRef(userId, 'timer');
    if (!timerRef) {
      console.error('[Realtime] Database not available');
      return null;
    }

    const unsubscribe = onValue(timerRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.val();
      if (!data || !data.isCheckedIn) {
        callback(null);
        return;
      }

      callback({
        startTime: data.startTime,
        pausedAt: data.pausedAt || null,
        pausedDuration: data.pausedDuration || 0,
        isPaused: data.isPaused || false,
      });
    }, (error) => {
      console.error('[Realtime] Error in timer subscription:', error);
      callback(null);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Realtime] Error setting up timer subscription:', error);
    return null;
  }
};

// History management
export const saveCheckInRealtime = async (userId: string, record: CheckInRecord): Promise<void> => {
  try {
    const historyRef = getUserRef(userId, `history/${record.id}`);
    if (!historyRef) {
      console.error('[Realtime] Database not available');
      return;
    }

    await set(historyRef, {
      id: record.id,
      startTime: record.startTime,
      endTime: record.endTime || null,
      duration: record.duration,
      status: record.status,
    });
    console.log('[Realtime] Check-in record saved');
  } catch (error) {
    console.error('[Realtime] Error saving check-in record:', error);
    throw error;
  }
};

export const getCheckInHistoryRealtime = async (userId: string): Promise<CheckInRecord[]> => {
  try {
    const historyRef = getUserRef(userId, 'history');
    if (!historyRef) {
      console.error('[Realtime] Database not available');
      return [];
    }

    const snapshot = await get(historyRef);
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    const records: CheckInRecord[] = [];

    for (const key in data) {
      records.push({
        id: data[key].id || key,
        startTime: data[key].startTime,
        endTime: data[key].endTime || undefined,
        duration: data[key].duration || 0,
        status: data[key].status || 'checked-out',
      });
    }

    // Sort by startTime, newest first
    return records.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  } catch (error) {
    console.error('[Realtime] Error loading check-in history:', error);
    return [];
  }
};

export const subscribeToHistoryRealtime = (
  userId: string,
  callback: (history: CheckInRecord[]) => void
): Unsubscribe | null => {
  try {
    const historyRef = getUserRef(userId, 'history');
    if (!historyRef) {
      console.error('[Realtime] Database not available');
      return null;
    }

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val();
      const records: CheckInRecord[] = [];

      for (const key in data) {
        records.push({
          id: data[key].id || key,
          startTime: data[key].startTime,
          endTime: data[key].endTime || undefined,
          duration: data[key].duration || 0,
          status: data[key].status || 'checked-out',
        });
      }

      // Sort by startTime, newest first
      records.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      callback(records);
    }, (error) => {
      console.error('[Realtime] Error in history subscription:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Realtime] Error setting up history subscription:', error);
    return null;
  }
};

export const deleteCheckInRealtime = async (userId: string, checkInId: string): Promise<void> => {
  try {
    const checkInRef = getUserRef(userId, `history/${checkInId}`);
    if (!checkInRef) {
      console.error('[Realtime] Database not available');
      return;
    }

    await remove(checkInRef);
    console.log('[Realtime] Check-in record deleted');
  } catch (error) {
    console.error('[Realtime] Error deleting check-in record:', error);
    throw error;
  }
};

export const clearHistoryRealtime = async (userId: string): Promise<void> => {
  try {
    const historyRef = getUserRef(userId, 'history');
    if (!historyRef) {
      console.error('[Realtime] Database not available');
      return;
    }

    await set(historyRef, null);
    console.log('[Realtime] History cleared');
  } catch (error) {
    console.error('[Realtime] Error clearing history:', error);
    throw error;
  }
};

// Settings management
export const saveSettingsRealtime = async (userId: string, settings: AppSettings): Promise<void> => {
  try {
    const settingsRef = getUserRef(userId, 'settings');
    if (!settingsRef) {
      console.error('[Realtime] Database not available');
      return;
    }

    await set(settingsRef, {
      targetHours: settings.targetHours,
      notificationsEnabled: settings.notificationsEnabled || false,
    });
    console.log('[Realtime] Settings saved');
  } catch (error) {
    console.error('[Realtime] Error saving settings:', error);
    throw error;
  }
};

export const getAppSettingsRealtime = async (userId: string): Promise<AppSettings> => {
  try {
    const settingsRef = getUserRef(userId, 'settings');
    if (!settingsRef) {
      console.error('[Realtime] Database not available');
      return {
        targetHours: 32400,
        notificationsEnabled: false,
      };
    }

    const snapshot = await get(settingsRef);
    if (!snapshot.exists()) {
      return {
        targetHours: 32400,
        notificationsEnabled: false,
      };
    }

    const data = snapshot.val();
    return {
      targetHours: data.targetHours || 32400,
      notificationsEnabled: data.notificationsEnabled || false,
    };
  } catch (error) {
    console.error('[Realtime] Error loading settings:', error);
    return {
      targetHours: 32400,
      notificationsEnabled: false,
    };
  }
};

export const subscribeToSettingsRealtime = (
  userId: string,
  callback: (settings: AppSettings) => void
): Unsubscribe | null => {
  try {
    const settingsRef = getUserRef(userId, 'settings');
    if (!settingsRef) {
      console.error('[Realtime] Database not available');
      return null;
    }

    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback({
          targetHours: 32400,
          notificationsEnabled: false,
        });
        return;
      }

      const data = snapshot.val();
      callback({
        targetHours: data.targetHours || 32400,
        notificationsEnabled: data.notificationsEnabled || false,
      });
    }, (error) => {
      console.error('[Realtime] Error in settings subscription:', error);
      callback({
        targetHours: 32400,
        notificationsEnabled: false,
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Realtime] Error setting up settings subscription:', error);
    return null;
  }
};

