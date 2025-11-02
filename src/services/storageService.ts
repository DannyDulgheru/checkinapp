import { CheckInRecord } from '../types/checkIn';
import {
  loadFromJsonAsync,
  saveToJson,
  addCheckInRecord,
  updateActiveCheckIn,
  deleteCheckInRecord,
  updateSettings,
  getSettings,
  AppSettings,
  subscribeToData,
} from './jsonStorageService';

export interface ActiveCheckInState {
  startTime: string; // ISO string
  pausedAt: string | null; // ISO string when paused
  pausedDuration: number; // Total paused time in seconds
  isPaused: boolean;
}

export const saveCheckIn = async (userId: string, record: CheckInRecord): Promise<void> => {
  try {
    await addCheckInRecord(userId, record);
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
};

export const getCheckInHistory = async (userId: string): Promise<CheckInRecord[]> => {
  try {
    const data = await loadFromJsonAsync(userId);
    return data.checkInHistory || [];
  } catch (error) {
    console.error('Error loading check-in history:', error);
    return [];
  }
};

export const clearHistory = async (userId: string): Promise<void> => {
  try {
    const data = await loadFromJsonAsync(userId);
    data.checkInHistory = [];
    data.lastSync = new Date().toISOString();
    await saveToJson(userId, data);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

// Active check-in state management - requires userId
export const saveActiveCheckIn = async (userId: string, state: ActiveCheckInState): Promise<void> => {
  try {
    await updateActiveCheckIn(userId, state);
  } catch (error) {
    console.error('Error saving active check-in:', error);
  }
};

export const getActiveCheckIn = async (userId: string): Promise<ActiveCheckInState | null> => {
  try {
    const data = await loadFromJsonAsync(userId);
    return data.activeCheckIn || null;
  } catch (error) {
    console.error('Error loading active check-in:', error);
    return null;
  }
};

export const clearActiveCheckIn = async (userId: string): Promise<void> => {
  try {
    await updateActiveCheckIn(userId, null);
  } catch (error) {
    console.error('Error clearing active check-in:', error);
  }
};

// Delete individual check-in record - requires userId
export const deleteCheckIn = async (userId: string, id: string): Promise<void> => {
  try {
    await deleteCheckInRecord(userId, id);
  } catch (error) {
    console.error('Error deleting check-in:', error);
    throw error;
  }
};

// Settings management - requires userId
export const saveSettings = async (userId: string, settings: AppSettings): Promise<void> => {
  try {
    await updateSettings(userId, settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getAppSettings = async (userId: string): Promise<AppSettings> => {
  try {
    return await getSettings(userId);
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      targetHours: 32400,
      notificationsEnabled: false,
    };
  }
};

// Subscribe to real-time data updates - requires userId
export { subscribeToData };

// Export AppSettings type
export type { AppSettings };
