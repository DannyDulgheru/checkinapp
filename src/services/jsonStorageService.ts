// JSON File Storage Service
// Stores all data in a JSON file structure using localStorage

import { CheckInRecord } from '../types/checkIn';
import { ActiveCheckInState } from './storageService';

export interface AppSettings {
  targetHours: number; // Target hours in seconds (default: 32400 = 9 hours)
  notificationsEnabled: boolean;
}

export interface AppData {
  checkInHistory: CheckInRecord[];
  activeCheckIn: ActiveCheckInState | null;
  settings: AppSettings;
  lastSync: string;
}

const JSON_FILE_KEY = '@checkinAppData';

// Save all data to JSON structure
export const saveToJson = async (data: AppData): Promise<void> => {
  try {
    // Save to localStorage as JSON string
    localStorage.setItem(JSON_FILE_KEY, JSON.stringify(data, null, 2));
    console.log('[JSONStorage] Data saved to JSON structure');
  } catch (error) {
    console.error('[JSONStorage] Error saving to JSON:', error);
    throw error;
  }
};

// Load all data from JSON structure
export const loadFromJson = (): AppData => {
  try {
    // AsyncStorage.getItem is async, but we'll keep this synchronous interface
    // for compatibility. In practice, this should be awaited in calling code.
    // We'll use a promise-based approach
    throw new Error('Use loadFromJsonAsync instead');
  } catch (error) {
    console.error('[JSONStorage] Error loading from JSON:', error);
    return {
      checkInHistory: [],
      activeCheckIn: null,
      lastSync: new Date().toISOString(),
    };
  }
};

// Async version of loadFromJson
export const loadFromJsonAsync = async (): Promise<AppData> => {
  try {
    const data = localStorage.getItem(JSON_FILE_KEY);
    if (data === null) {
      return {
        checkInHistory: [],
        activeCheckIn: null,
        settings: {
          targetHours: 32400, // 9 hours default
          notificationsEnabled: false,
        },
        lastSync: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(data) as AppData;
    // Ensure all fields exist
    return {
      checkInHistory: parsed.checkInHistory || [],
      activeCheckIn: parsed.activeCheckIn || null,
      settings: parsed.settings || {
        targetHours: 32400,
        notificationsEnabled: false,
      },
      lastSync: parsed.lastSync || new Date().toISOString(),
    };
  } catch (error) {
    console.error('[JSONStorage] Error loading from JSON:', error);
    return {
      checkInHistory: [],
      activeCheckIn: null,
      lastSync: new Date().toISOString(),
    };
  }
};

// Update check-in history in JSON
export const updateCheckInHistory = async (history: CheckInRecord[]): Promise<void> => {
  const data = await loadFromJsonAsync();
  data.checkInHistory = history;
  data.lastSync = new Date().toISOString();
  await saveToJson(data);
};

// Add check-in record to JSON
export const addCheckInRecord = async (record: CheckInRecord): Promise<void> => {
  const data = await loadFromJsonAsync();
  data.checkInHistory.push(record);
  data.lastSync = new Date().toISOString();
  await saveToJson(data);
};

// Update active check-in in JSON
export const updateActiveCheckIn = async (activeCheckIn: ActiveCheckInState | null): Promise<void> => {
  const data = await loadFromJsonAsync();
  data.activeCheckIn = activeCheckIn;
  data.lastSync = new Date().toISOString();
  await saveToJson(data);
};

// Delete check-in record by ID
export const deleteCheckInRecord = async (id: string): Promise<void> => {
  const data = await loadFromJsonAsync();
  data.checkInHistory = data.checkInHistory.filter(record => record.id !== id);
  data.lastSync = new Date().toISOString();
  await saveToJson(data);
};

// Update settings
export const updateSettings = async (settings: AppSettings): Promise<void> => {
  const data = await loadFromJsonAsync();
  data.settings = settings;
  data.lastSync = new Date().toISOString();
  await saveToJson(data);
};

// Get settings
export const getSettings = async (): Promise<AppSettings> => {
  const data = await loadFromJsonAsync();
  return data.settings || {
    targetHours: 32400,
    notificationsEnabled: false,
  };
};

// Clear all data
export const clearJsonData = async (): Promise<void> => {
  await saveToJson({
    checkInHistory: [],
    activeCheckIn: null,
    settings: {
      targetHours: 32400,
      notificationsEnabled: false,
    },
    lastSync: new Date().toISOString(),
  });
};
