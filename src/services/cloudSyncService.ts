// Cloud Sync Service
// Syncs data across all devices using Firebase Firestore as the primary source
// Uses user ID for multi-device sync

import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, type Timestamp, type Unsubscribe } from 'firebase/firestore';
import { AppData, AppSettings } from './jsonStorageService';
import { CheckInRecord } from '../types/checkIn';
import { ActiveCheckInState } from './storageService';
import { db, firebaseInitialized } from './firebase';

// Enable sync with Firebase (only if Firebase is initialized)
const SYNC_ENABLED = firebaseInitialized && db !== null;
const COLLECTION_NAME = 'checkinData';

// Get user document ID (use userId for authentication-based sync)
const getUserDocId = (userId: string): string => {
  return `user_${userId}`;
};

// Sync data to Firebase Firestore (primary source of truth) - requires user ID
export const syncToCloud = async (userId: string, data: AppData): Promise<void> => {
  if (!SYNC_ENABLED) {
    console.log('[CloudSync] Cloud sync is disabled - Firebase not available');
    return;
  }

  try {
    if (!db) {
      console.log('[CloudSync] Firebase database not available');
      return;
    }

    if (!userId) {
      console.log('[CloudSync] User ID required for sync');
      return;
    }

    const userDocId = getUserDocId(userId);
    const userDocRef = doc(db, COLLECTION_NAME, userDocId);

    await setDoc(userDocRef, {
      checkInHistory: data.checkInHistory || [],
      activeCheckIn: data.activeCheckIn || null,
      settings: data.settings || {
        targetHours: 32400,
        notificationsEnabled: false,
      },
      lastSync: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: userId,
    }, { merge: true });

    console.log('[CloudSync] Data synced to Firebase successfully');
  } catch (error) {
    console.error('[CloudSync] Error syncing to Firebase:', error);
    // Don't throw - allow app to continue working offline
  }
};

// Load data from Firebase Firestore (primary source of truth) - requires user ID
export const loadFromCloud = async (userId: string): Promise<AppData | null> => {
  if (!SYNC_ENABLED) {
    console.log('[CloudSync] Cloud sync is disabled - Firebase not available');
    return null;
  }

  try {
    if (!db) {
      console.log('[CloudSync] Firebase database not available');
      return null;
    }

    if (!userId) {
      console.log('[CloudSync] User ID required for load');
      return null;
    }

    const userDocId = getUserDocId(userId);
    const userDocRef = doc(db, COLLECTION_NAME, userDocId);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      console.log('[CloudSync] No data found in Firebase for this user');
      return null;
    }

    const data = docSnap.data();
    console.log('[CloudSync] Data loaded from Firebase successfully');

    // Convert Firestore timestamp to ISO string
    let lastSync: string;
    if (data.lastSync && typeof data.lastSync.toDate === 'function') {
      lastSync = (data.lastSync as Timestamp).toDate().toISOString();
    } else if (data.lastSync) {
      lastSync = data.lastSync.toString();
    } else if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
      lastSync = (data.updatedAt as Timestamp).toDate().toISOString();
    } else {
      lastSync = new Date().toISOString();
    }

    return {
      checkInHistory: (data.checkInHistory || []) as CheckInRecord[],
      activeCheckIn: (data.activeCheckIn || null) as ActiveCheckInState | null,
      settings: (data.settings || {
        targetHours: 32400,
        notificationsEnabled: false,
      }) as AppSettings,
      lastSync: lastSync,
    };
  } catch (error) {
    console.error('[CloudSync] Error loading from Firebase:', error);
    return null;
  }
};

// Subscribe to real-time updates from Firebase - requires user ID
export const subscribeToCloudData = (
  userId: string,
  callback: (data: AppData | null) => void
): Unsubscribe | null => {
  if (!SYNC_ENABLED || !db || !userId) {
    console.log('[CloudSync] Cannot subscribe - Firebase or user ID not available');
    return null;
  }

  try {
    const userDocId = getUserDocId(userId);
    const userDocRef = doc(db, COLLECTION_NAME, userDocId);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          console.log('[CloudSync] No data found in Firebase for this user');
          callback(null);
          return;
        }

        const data = docSnap.data();
        
        // Convert Firestore timestamp to ISO string
        let lastSync: string;
        if (data.lastSync && typeof data.lastSync.toDate === 'function') {
          lastSync = (data.lastSync as Timestamp).toDate().toISOString();
        } else if (data.lastSync) {
          lastSync = data.lastSync.toString();
        } else if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
          lastSync = (data.updatedAt as Timestamp).toDate().toISOString();
        } else {
          lastSync = new Date().toISOString();
        }

        const appData: AppData = {
          checkInHistory: (data.checkInHistory || []) as CheckInRecord[],
          activeCheckIn: (data.activeCheckIn || null) as ActiveCheckInState | null,
          settings: (data.settings || {
            targetHours: 32400,
            notificationsEnabled: false,
          }) as AppSettings,
          lastSync: lastSync,
        };

        callback(appData);
      },
      (error) => {
        console.error('[CloudSync] Error in real-time subscription:', error);
        callback(null);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[CloudSync] Error setting up real-time subscription:', error);
    return null;
  }
};

// Merge local and cloud data (Firebase takes precedence as source of truth)
export const mergeData = (localData: AppData, cloudData: AppData): AppData => {
  // Compare lastSync timestamps
  const localTime = new Date(localData.lastSync).getTime();
  const cloudTime = new Date(cloudData.lastSync).getTime();

  // Firebase is the source of truth - prioritize cloud data
  // Merge intelligently to combine data from both sources
  const mergedData: AppData = {
    ...cloudData,
    // Preserve local active check-in if it exists and is more recent
    activeCheckIn: localData.activeCheckIn || cloudData.activeCheckIn,
  };

  // Merge history arrays from both sources and remove duplicates
  const historyMap = new Map<string, CheckInRecord>();
  
  // Add cloud history first (Firebase is source of truth)
  cloudData.checkInHistory.forEach(record => {
    historyMap.set(record.id, record);
  });
  
  // Add local history, but only if it doesn't exist in cloud or is newer
  localData.checkInHistory.forEach(record => {
    const existing = historyMap.get(record.id);
    if (!existing) {
      // New record from local - add it
      historyMap.set(record.id, record);
    } else {
      // Record exists in both - use the one with newer startTime
      const existingTime = new Date(existing.startTime).getTime();
      const localTime = new Date(record.startTime).getTime();
      if (localTime > existingTime) {
        historyMap.set(record.id, record);
      }
    }
  });

  mergedData.checkInHistory = Array.from(historyMap.values()).sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Use the latest sync time
  mergedData.lastSync = cloudTime >= localTime 
    ? cloudData.lastSync 
    : localData.lastSync;

  return mergedData;
};

// Sync settings to cloud (already handled by syncToCloud, but kept for compatibility)
export const syncSettings = async (_settings: AppSettings): Promise<void> => {
  if (!SYNC_ENABLED) return;
  
  // Settings are synced automatically when saveToJson is called
  // This function is kept for backward compatibility
};

// Check if cloud sync is enabled
export const isCloudSyncEnabled = (): boolean => {
  return SYNC_ENABLED;
};
