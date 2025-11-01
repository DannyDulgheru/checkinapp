import { CheckInRecord } from '../types/checkIn';
import {
  loadFromJson,
  saveToJson,
  addCheckInRecord,
  updateCheckInHistory,
  updateActiveCheckIn,
  clearJsonData,
} from './jsonStorageService';

export interface ActiveCheckInState {
  startTime: string; // ISO string
  pausedAt: string | null; // ISO string when paused
  pausedDuration: number; // Total paused time in seconds
  isPaused: boolean;
}

export const saveCheckIn = async (record: CheckInRecord): Promise<void> => {
  try {
    addCheckInRecord(record);
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
};

export const getCheckInHistory = async (): Promise<CheckInRecord[]> => {
  try {
    const data = loadFromJson();
    return data.checkInHistory || [];
  } catch (error) {
    console.error('Error loading check-in history:', error);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    const data = loadFromJson();
    data.checkInHistory = [];
    data.lastSync = new Date().toISOString();
    saveToJson(data);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

// Active check-in state management
export const saveActiveCheckIn = (state: ActiveCheckInState): void => {
  try {
    updateActiveCheckIn(state);
  } catch (error) {
    console.error('Error saving active check-in:', error);
  }
};

export const getActiveCheckIn = (): ActiveCheckInState | null => {
  try {
    const data = loadFromJson();
    return data.activeCheckIn || null;
  } catch (error) {
    console.error('Error loading active check-in:', error);
    return null;
  }
};

export const clearActiveCheckIn = (): void => {
  try {
    updateActiveCheckIn(null);
  } catch (error) {
    console.error('Error clearing active check-in:', error);
  }
};
