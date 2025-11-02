// Firebase Storage Service
// Stores all data in Firebase Firestore as primary source
// Uses localStorage only as cache for offline support

import { CheckInRecord } from '../types/checkIn';
import { ActiveCheckInState } from './storageService';
import { syncToCloud, loadFromCloud, mergeData, isCloudSyncEnabled, subscribeToCloudData } from './cloudSyncService';
import type { Unsubscribe } from 'firebase/firestore';

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

// Save all data - Firebase is the primary source
export const saveToJson = async (userId: string, data: AppData): Promise<void> => {
  try {
    // Sync to Firebase first (primary source of truth)
    if (isCloudSyncEnabled() && userId) {
      try {
        await syncToCloud(userId, data);
        console.log('[FirebaseStorage] Data synced to Firebase');
      } catch (error) {
        console.error('[FirebaseStorage] Error syncing to Firebase:', error);
        // Continue to save locally even if Firebase sync fails
      }
    }
    
    // Save to localStorage as local cache (only if user is logged in)
    if (userId) {
      localStorage.setItem(`${JSON_FILE_KEY}_${userId}`, JSON.stringify(data, null, 2));
      console.log('[FirebaseStorage] Data saved to local cache');
    }
  } catch (error) {
    console.error('[FirebaseStorage] Error saving data:', error);
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
      settings: {
        targetHours: 32400,
        notificationsEnabled: false,
      },
      lastSync: new Date().toISOString(),
    };
  }
};

// Load data - Firebase is the primary source
export const loadFromJsonAsync = async (userId: string): Promise<AppData> => {
  try {
    if (!userId) {
      console.log('[FirebaseStorage] No user ID provided');
      return getDefaultData();
    }

    // Try to load from Firebase first (primary source of truth)
    if (isCloudSyncEnabled()) {
      try {
        const cloudData = await loadFromCloud(userId);
        if (cloudData) {
          // Load local cache
          const localDataString = localStorage.getItem(`${JSON_FILE_KEY}_${userId}`);
          if (localDataString) {
            try {
              const parsed = JSON.parse(localDataString) as AppData;
              const localData: AppData = {
                checkInHistory: parsed.checkInHistory || [],
                activeCheckIn: parsed.activeCheckIn || null,
                settings: parsed.settings || {
                  targetHours: 32400,
                  notificationsEnabled: false,
                },
                lastSync: parsed.lastSync || new Date().toISOString(),
              };
              
              // Merge Firebase data with local cache
              const mergedData = mergeData(localData, cloudData);
              
              // Update local cache with merged data
              localStorage.setItem(`${JSON_FILE_KEY}_${userId}`, JSON.stringify(mergedData, null, 2));
              
              // Sync merged data back to Firebase to ensure consistency
              syncToCloud(userId, mergedData).catch(error => {
                console.error('[FirebaseStorage] Background cloud sync after merge failed:', error);
              });
              
              return mergedData;
            } catch (parseError) {
              console.error('[FirebaseStorage] Error parsing local cache:', parseError);
              // Use Firebase data if local parse fails
            }
          }
          
          // Save Firebase data to local cache
          localStorage.setItem(`${JSON_FILE_KEY}_${userId}`, JSON.stringify(cloudData, null, 2));
          return cloudData;
        }
      } catch (error) {
        console.error('[FirebaseStorage] Error loading from Firebase:', error);
        // Fall back to local cache if Firebase fails
      }
    }

    // Fallback to local cache if Firebase is disabled or unavailable
    const localDataString = localStorage.getItem(`${JSON_FILE_KEY}_${userId}`);
    if (localDataString === null) {
      const defaultData = getDefaultData();
      
      // Try to sync default data to Firebase if enabled
      if (isCloudSyncEnabled()) {
        syncToCloud(userId, defaultData).catch(error => {
          console.error('[FirebaseStorage] Background cloud sync failed:', error);
        });
      }
      
      return defaultData;
    } else {
      const parsed = JSON.parse(localDataString) as AppData;
      return {
        checkInHistory: parsed.checkInHistory || [],
        activeCheckIn: parsed.activeCheckIn || null,
        settings: parsed.settings || {
          targetHours: 32400,
          notificationsEnabled: false,
        },
        lastSync: parsed.lastSync || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('[FirebaseStorage] Error loading data:', error);
    return getDefaultData();
  }
};

// Get default data
const getDefaultData = (): AppData => {
  return {
    checkInHistory: [],
    activeCheckIn: null,
    settings: {
      targetHours: 32400,
      notificationsEnabled: false,
    },
    lastSync: new Date().toISOString(),
  };
};

// Subscribe to real-time updates from Firebase
export const subscribeToData = (
  userId: string,
  callback: (data: AppData | null) => void
): Unsubscribe | null => {
  if (!userId || !isCloudSyncEnabled()) {
    return null;
  }

  const unsubscribe = subscribeToCloudData(userId, (cloudData) => {
    if (cloudData) {
      // Update local cache when Firebase data changes
      localStorage.setItem(`${JSON_FILE_KEY}_${userId}`, JSON.stringify(cloudData, null, 2));
    }
    callback(cloudData);
  });

  return unsubscribe;
};

// Update check-in history - requires userId
export const updateCheckInHistory = async (userId: string, history: CheckInRecord[]): Promise<void> => {
  const data = await loadFromJsonAsync(userId);
  data.checkInHistory = history;
  data.lastSync = new Date().toISOString();
  await saveToJson(userId, data);
};

// Add check-in record - requires userId
export const addCheckInRecord = async (userId: string, record: CheckInRecord): Promise<void> => {
  const data = await loadFromJsonAsync(userId);
  data.checkInHistory.push(record);
  data.lastSync = new Date().toISOString();
  await saveToJson(userId, data);
};

// Update active check-in - requires userId
export const updateActiveCheckIn = async (userId: string, activeCheckIn: ActiveCheckInState | null): Promise<void> => {
  const data = await loadFromJsonAsync(userId);
  data.activeCheckIn = activeCheckIn;
  data.lastSync = new Date().toISOString();
  await saveToJson(userId, data);
};

// Delete check-in record by ID - requires userId
export const deleteCheckInRecord = async (userId: string, id: string): Promise<void> => {
  const data = await loadFromJsonAsync(userId);
  data.checkInHistory = data.checkInHistory.filter(record => record.id !== id);
  data.lastSync = new Date().toISOString();
  await saveToJson(userId, data);
};

// Update settings - requires userId
export const updateSettings = async (userId: string, settings: AppSettings): Promise<void> => {
  const data = await loadFromJsonAsync(userId);
  data.settings = settings;
  data.lastSync = new Date().toISOString();
  await saveToJson(userId, data);
};

// Get settings - requires userId
export const getSettings = async (userId: string): Promise<AppSettings> => {
  const data = await loadFromJsonAsync(userId);
  return data.settings || {
    targetHours: 32400,
    notificationsEnabled: false,
  };
};

// Clear all data - requires userId
export const clearJsonData = async (userId: string): Promise<void> => {
  await saveToJson(userId, getDefaultData());
};
