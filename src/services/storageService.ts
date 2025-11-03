import { CheckInRecord } from '../types/checkIn';
import {
  saveActiveCheckInFirestore,
  getActiveCheckInFirestore,
  saveCheckInFirestore,
  getCheckInHistoryFirestore,
  deleteCheckInFirestore,
  clearHistoryFirestore,
  saveSettingsFirestore,
  getAppSettingsFirestore,
  subscribeToHistoryFirestore,
  subscribeToSettingsFirestore,
} from './firestoreService';

export interface ActiveCheckInState {
  startTime: string; // ISO string - only this is saved to Firebase
  isPaused: boolean; // Only this is saved to Firebase
  // pausedAt and pausedDuration are calculated locally, not saved to Firebase
}

export const saveCheckIn = async (userId: string, record: CheckInRecord): Promise<void> => {
  try {
    await saveCheckInFirestore(userId, record);
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
};

export const getCheckInHistory = async (userId: string): Promise<CheckInRecord[]> => {
  try {
    return await getCheckInHistoryFirestore(userId);
  } catch (error) {
    console.error('Error loading check-in history:', error);
    return [];
  }
};

export const clearHistory = async (userId: string): Promise<void> => {
  try {
    await clearHistoryFirestore(userId);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

// Active check-in state management - requires userId
export const saveActiveCheckIn = async (userId: string, state: ActiveCheckInState | null): Promise<void> => {
  try {
    await saveActiveCheckInFirestore(userId, state);
  } catch (error) {
    console.error('Error saving active check-in:', error);
  }
};

export const getActiveCheckIn = async (userId: string): Promise<ActiveCheckInState | null> => {
  try {
    return await getActiveCheckInFirestore(userId);
  } catch (error) {
    console.error('Error loading active check-in:', error);
    return null;
  }
};

export const clearActiveCheckIn = async (userId: string): Promise<void> => {
  try {
    await saveActiveCheckInFirestore(userId, null);
  } catch (error) {
    console.error('Error clearing active check-in:', error);
  }
};

// Delete individual check-in record - requires userId
export const deleteCheckIn = async (userId: string, id: string): Promise<void> => {
  try {
    await deleteCheckInFirestore(userId, id);
  } catch (error) {
    console.error('Error deleting check-in:', error);
    throw error;
  }
};

// Settings management - requires userId
export const saveSettings = async (userId: string, settings: AppSettings): Promise<void> => {
  try {
    await saveSettingsFirestore(userId, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getAppSettings = async (userId: string): Promise<AppSettings> => {
  try {
    return await getAppSettingsFirestore(userId);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      targetHours: 32400,
      notificationsEnabled: false,
    };
  }
};

// Subscribe to real-time data updates - requires userId
// Note: Timer subscription removed to reduce Firebase writes - timer is loaded once on mount
export const subscribeToData = (
  userId: string,
  callback: (data: { activeCheckIn: ActiveCheckInState | null; checkInHistory?: CheckInRecord[]; settings?: AppSettings }) => void
): (() => void) | null => {
  let historyUnsubscribe: (() => void) | null = null;
  let settingsUnsubscribe: (() => void) | null = null;

  // Timer is loaded once on mount via getActiveCheckIn, not via subscription
  // This reduces Firebase reads/writes significantly
  const activeCheckIn: { current: ActiveCheckInState | null } = { current: null };
  const history: { current: CheckInRecord[] } = { current: [] };
  const settings: { current: AppSettings } = { current: { targetHours: 32400, notificationsEnabled: false } };

  const notifyCallback = () => {
    callback({
      activeCheckIn: activeCheckIn.current,
      checkInHistory: history.current,
      settings: settings.current,
    });
  };

  // Subscribe to history (real-time sync for history)
  historyUnsubscribe = subscribeToHistoryFirestore(userId, (records) => {
    history.current = records;
    notifyCallback();
  });

  // Subscribe to settings (real-time sync for settings)
  settingsUnsubscribe = subscribeToSettingsFirestore(userId, (appSettings) => {
    settings.current = appSettings;
    notifyCallback();
  });

  return () => {
    if (historyUnsubscribe && typeof historyUnsubscribe === 'function') historyUnsubscribe();
    if (settingsUnsubscribe && typeof settingsUnsubscribe === 'function') settingsUnsubscribe();
  };
};

// AppSettings type definition
export interface AppSettings {
  targetHours: number;
  notificationsEnabled: boolean;
}
