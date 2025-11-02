import { CheckInRecord } from '../types/checkIn';
import {
  loadFromJsonAsync,
  saveToJson,
  addCheckInRecord,
  updateCheckInHistory,
  updateActiveCheckIn,
  clearJsonData,
  deleteCheckInRecord,
  updateSettings,
  getSettings,
  AppSettings,
} from './jsonStorageService';

export interface ActiveCheckInState {
  startTime: string; // ISO string
  pausedAt: string | null; // ISO string when paused
  pausedDuration: number; // Total paused time in seconds
  isPaused: boolean;
}

export const saveCheckIn = async (record: CheckInRecord): Promise<void> => {
  try {
    await addCheckInRecord(record);
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
};

export const getCheckInHistory = async (): Promise<CheckInRecord[]> => {
  try {
    const data = await loadFromJsonAsync();
    return data.checkInHistory || [];
  } catch (error) {
    console.error('Error loading check-in history:', error);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    const data = await loadFromJsonAsync();
    data.checkInHistory = [];
    data.lastSync = new Date().toISOString();
    await saveToJson(data);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

// Active check-in state management
export const saveActiveCheckIn = async (state: ActiveCheckInState): Promise<void> => {
  try {
    await updateActiveCheckIn(state);
  } catch (error) {
    console.error('Error saving active check-in:', error);
  }
};

export const getActiveCheckIn = async (): Promise<ActiveCheckInState | null> => {
  try {
    const data = await loadFromJsonAsync();
    return data.activeCheckIn || null;
  } catch (error) {
    console.error('Error loading active check-in:', error);
    return null;
  }
};

export const clearActiveCheckIn = async (): Promise<void> => {
  try {
    await updateActiveCheckIn(null);
  } catch (error) {
    console.error('Error clearing active check-in:', error);
  }
};

// Delete individual check-in record
export const deleteCheckIn = async (id: string): Promise<void> => {
  try {
    await deleteCheckInRecord(id);
  } catch (error) {
    console.error('Error deleting check-in:', error);
    throw error;
  }
};

// Settings management
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await updateSettings(settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    return await getSettings();
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      targetHours: 32400,
      notificationsEnabled: false,
    };
  }
};

// Export AppSettings type
export type { AppSettings };
