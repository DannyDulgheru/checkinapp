import { db, firebaseInitialized } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { CheckInRecord } from '../types/checkIn';
import { ActiveCheckInState, AppSettings } from './storageService';

// Get user document reference
const getUserDocRef = (userId: string) => {
  if (!db || !firebaseInitialized || !userId) {
    return null;
  }
  return doc(db, 'checkinData', userId);
};

// Timer state management
export const saveActiveCheckInFirestore = async (userId: string, state: ActiveCheckInState | null): Promise<void> => {
  try {
    if (!db || !firebaseInitialized) {
      console.error('[Firestore] Database not initialized');
      throw new Error('Firestore not initialized');
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      throw new Error('Cannot create document reference');
    }

    if (state) {
      const data = {
        timer: {
          startTime: state.startTime,
          pausedAt: state.pausedAt,
          pausedDuration: state.pausedDuration,
          isPaused: state.isPaused,
          isCheckedIn: true,
        },
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(userDocRef, data, { merge: true });
      console.log('[Firestore] Active check-in saved');
    } else {
      await updateDoc(userDocRef, {
        timer: null,
        updatedAt: serverTimestamp(),
      });
      console.log('[Firestore] Active check-in cleared');
    }
  } catch (error: any) {
    console.error('[Firestore] Error saving active check-in:', error);
    if (error.code === 'permission-denied') {
      console.error('[Firestore] Permission denied! Check Firestore rules.');
    }
    throw error;
  }
};

export const getActiveCheckInFirestore = async (userId: string): Promise<ActiveCheckInState | null> => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return null;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      return null;
    }

    const docSnapshot = await getDoc(userDocRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.timer && data.timer.isCheckedIn) {
        return {
          startTime: data.timer.startTime,
          pausedAt: data.timer.pausedAt || null,
          pausedDuration: data.timer.pausedDuration || 0,
          isPaused: data.timer.isPaused || false,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Firestore] Error getting active check-in:', error);
    return null;
  }
};

export const subscribeToTimerFirestore = (
  userId: string,
  callback: (state: ActiveCheckInState | null) => void
): (() => void) | null => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return null;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      return null;
    }

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.timer && data.timer.isCheckedIn) {
          callback({
            startTime: data.timer.startTime,
            pausedAt: data.timer.pausedAt || null,
            pausedDuration: data.timer.pausedDuration || 0,
            isPaused: data.timer.isPaused || false,
          });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('[Firestore] Error in timer subscription:', error);
      callback(null);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firestore] Error setting up timer subscription:', error);
    return null;
  }
};

// History management
export const saveCheckInFirestore = async (userId: string, record: CheckInRecord): Promise<void> => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      throw new Error('Cannot create document reference');
    }

    // Get existing data
    const docSnapshot = await getDoc(userDocRef);
    const existingData = docSnapshot.exists() ? docSnapshot.data() : {};
    const existingHistory = existingData.history || {};

    // Update history with new record
    await setDoc(userDocRef, {
      history: {
        ...existingHistory,
        [record.id]: {
          id: record.id,
          startTime: record.startTime,
          endTime: record.endTime || null,
          duration: record.duration,
          status: record.status,
        },
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log('[Firestore] Check-in record saved');
  } catch (error: any) {
    console.error('[Firestore] Error saving check-in record:', error);
    throw error;
  }
};

export const getCheckInHistoryFirestore = async (userId: string): Promise<CheckInRecord[]> => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return [];
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      return [];
    }

    const docSnapshot = await getDoc(userDocRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const historyObject = data.history || {};
      
      // Convert object to array
      const historyArray: CheckInRecord[] = Object.values(historyObject).map((item: any) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.duration,
        status: item.status,
      }));

      // Sort by startTime, newest first
      historyArray.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      console.log(`[Firestore] Loaded ${historyArray.length} history records`);
      return historyArray;
    }

    return [];
  } catch (error) {
    console.error('[Firestore] Error getting check-in history:', error);
    return [];
  }
};

export const deleteCheckInFirestore = async (userId: string, recordId: string): Promise<void> => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      throw new Error('Cannot create document reference');
    }

    // Get existing data
    const docSnapshot = await getDoc(userDocRef);
    const existingData = docSnapshot.exists() ? docSnapshot.data() : {};
    const existingHistory = existingData.history || {};

    // Remove the record
    delete existingHistory[recordId];

    await updateDoc(userDocRef, {
      history: existingHistory,
      updatedAt: serverTimestamp(),
    });

    console.log('[Firestore] Check-in record deleted');
  } catch (error: any) {
    console.error('[Firestore] Error deleting check-in record:', error);
    throw error;
  }
};

export const clearHistoryFirestore = async (userId: string): Promise<void> => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      throw new Error('Cannot create document reference');
    }

    await updateDoc(userDocRef, {
      history: {},
      updatedAt: serverTimestamp(),
    });

    console.log('[Firestore] History cleared');
  } catch (error: any) {
    console.error('[Firestore] Error clearing history:', error);
    throw error;
  }
};

export const subscribeToHistoryFirestore = (
  userId: string,
  callback: (history: CheckInRecord[]) => void
): (() => void) | null => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return null;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      return null;
    }

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const historyObject = data.history || {};
        
        // Convert object to array
        const historyArray: CheckInRecord[] = Object.values(historyObject).map((item: any) => ({
          id: item.id,
          startTime: item.startTime,
          endTime: item.endTime,
          duration: item.duration,
          status: item.status,
        }));

        // Sort by startTime, newest first
        historyArray.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        callback(historyArray);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('[Firestore] Error in history subscription:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firestore] Error setting up history subscription:', error);
    return null;
  }
};

// Settings management
export const saveSettingsFirestore = async (userId: string, settings: AppSettings): Promise<void> => {
  try {
    if (!db || !firebaseInitialized) {
      console.error('[Firestore] Database not initialized');
      throw new Error('Firestore not initialized');
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      throw new Error('Cannot create document reference');
    }

    await setDoc(userDocRef, {
      settings: {
        targetHours: settings.targetHours,
        notificationsEnabled: settings.notificationsEnabled,
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log('[Firestore] Settings saved');
  } catch (error: any) {
    console.error('[Firestore] Error saving settings:', error);
    if (error.code === 'permission-denied') {
      console.error('[Firestore] Permission denied! Check Firestore rules.');
    }
    throw error;
  }
};

export const getAppSettingsFirestore = async (userId: string): Promise<AppSettings> => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return { targetHours: 32400, notificationsEnabled: false };
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      return { targetHours: 32400, notificationsEnabled: false };
    }

    const docSnapshot = await getDoc(userDocRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data.settings) {
        return {
          targetHours: data.settings.targetHours || 32400,
          notificationsEnabled: data.settings.notificationsEnabled || false,
        };
      }
    }

    return { targetHours: 32400, notificationsEnabled: false };
  } catch (error) {
    console.error('[Firestore] Error getting settings:', error);
    return { targetHours: 32400, notificationsEnabled: false };
  }
};

export const subscribeToSettingsFirestore = (
  userId: string,
  callback: (settings: AppSettings) => void
): (() => void) | null => {
  try {
    if (!db || !firebaseInitialized) {
      console.warn('[Firestore] Database not initialized');
      return null;
    }

    const userDocRef = getUserDocRef(userId);
    if (!userDocRef) {
      return null;
    }

    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.settings) {
          callback({
            targetHours: data.settings.targetHours || 32400,
            notificationsEnabled: data.settings.notificationsEnabled || false,
          });
        } else {
          callback({ targetHours: 32400, notificationsEnabled: false });
        }
      } else {
        callback({ targetHours: 32400, notificationsEnabled: false });
      }
    }, (error) => {
      console.error('[Firestore] Error in settings subscription:', error);
      callback({ targetHours: 32400, notificationsEnabled: false });
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firestore] Error setting up settings subscription:', error);
    return null;
  }
};

