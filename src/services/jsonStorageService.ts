// JSON File Storage Service
// Stores all data in a JSON file structure

import { CheckInRecord } from '../types/checkIn';
import { ActiveCheckInState } from './storageService';

export interface AppData {
  checkInHistory: CheckInRecord[];
  activeCheckIn: ActiveCheckInState | null;
  lastSync: string;
}

const JSON_FILE_KEY = '@checkinAppData';

// Save all data to JSON structure
export const saveToJson = (data: AppData): void => {
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
    const data = localStorage.getItem(JSON_FILE_KEY);
    if (data === null) {
      return {
        checkInHistory: [],
        activeCheckIn: null,
        lastSync: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(data) as AppData;
    // Ensure all fields exist
    return {
      checkInHistory: parsed.checkInHistory || [],
      activeCheckIn: parsed.activeCheckIn || null,
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

// Export data as JSON file (download)
export const exportToJsonFile = (): void => {
  try {
    const data = loadFromJson();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checkin-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('[JSONStorage] Data exported to JSON file');
  } catch (error) {
    console.error('[JSONStorage] Error exporting to JSON file:', error);
    window.alert('Nu s-a putut exporta fișierul JSON');
  }
};

// Import data from JSON file (upload)
export const importFromJsonFile = async (file: File): Promise<boolean> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as AppData;
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON structure');
    }
    
    // Save imported data
    saveToJson({
      checkInHistory: data.checkInHistory || [],
      activeCheckIn: data.activeCheckIn || null,
      lastSync: new Date().toISOString(),
    });
    
    console.log('[JSONStorage] Data imported from JSON file');
    return true;
  } catch (error) {
    console.error('[JSONStorage] Error importing from JSON file:', error);
    window.alert('Nu s-a putut importa fișierul JSON. Format invalid.');
    return false;
  }
};

// Update check-in history in JSON
export const updateCheckInHistory = (history: CheckInRecord[]): void => {
  const data = loadFromJson();
  data.checkInHistory = history;
  data.lastSync = new Date().toISOString();
  saveToJson(data);
};

// Add check-in record to JSON
export const addCheckInRecord = (record: CheckInRecord): void => {
  const data = loadFromJson();
  data.checkInHistory.push(record);
  data.lastSync = new Date().toISOString();
  saveToJson(data);
};

// Update active check-in in JSON
export const updateActiveCheckIn = (activeCheckIn: ActiveCheckInState | null): void => {
  const data = loadFromJson();
  data.activeCheckIn = activeCheckIn;
  data.lastSync = new Date().toISOString();
  saveToJson(data);
};

// Clear all data
export const clearJsonData = (): void => {
  saveToJson({
    checkInHistory: [],
    activeCheckIn: null,
    lastSync: new Date().toISOString(),
  });
};

