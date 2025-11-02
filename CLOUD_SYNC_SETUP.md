# Cloud Sync Setup Guide

This app now supports cloud synchronization across multiple devices using Firebase Firestore as the primary data source. Your check-in history, settings, and active check-ins will be synced automatically.

## How It Works

1. **Firebase First**: Firebase Firestore is the primary source of truth for all data
2. **Local Cache**: Data is cached in localStorage for offline functionality
3. **Auto Sync**: Changes are automatically synced to Firebase whenever data changes
4. **Cross-Device**: When you open the app on any device, it loads data from Firebase and merges with local cache
5. **Conflict Resolution**: Firebase data takes precedence, with intelligent merging of history records

## Setup Instructions

### Firebase Setup (Required)

1. Firebase is already configured in `src/services/firebase.ts`
2. Ensure Firestore Database is enabled in your Firebase console at https://console.firebase.google.com
3. The app uses Firestore collection `checkinData` with documents keyed by device ID
4. Firebase package is installed: `npm install firebase`

### Data Structure in Firebase

Data is stored in Firestore with the following structure:
- **Collection**: `checkinData`
- **Document ID**: Device ID (generated once per device, stored in localStorage)
- **Document Fields**:
  - `checkInHistory`: Array of check-in records
  - `activeCheckIn`: Current active check-in state or null
  - `settings`: App settings (target hours, notifications)
  - `lastSync`: Server timestamp of last sync
  - `deviceId`: Device identifier
  - `updatedAt`: Server timestamp of last update

### Multi-Device Sync

- Each device has its own document in Firebase (keyed by device ID)
- To sync the same data across multiple devices, you can manually use the same device ID
- For shared data across all your devices, consider implementing user authentication in the future

## Features

- ✅ Firebase as primary data source
- ✅ Automatic sync to Firebase on every data change
- ✅ Loads from Firebase first, then merges with local cache
- ✅ Offline support (local cache works without internet)
- ✅ Intelligent conflict resolution (Firebase data takes precedence)
- ✅ Device identification (each device has unique ID)
- ✅ Real-time sync across devices

## How Data Flows

### Saving Data
1. Data is saved to Firebase Firestore (primary source)
2. Data is also saved to localStorage (local cache)
3. If Firebase sync fails, data is still saved locally

### Loading Data
1. First attempt: Load from Firebase
2. If Firebase data exists, merge with local cache
3. If Firebase fails or is unavailable, fall back to local cache
4. Merged data is saved back to both Firebase and local cache

## Security Notes

For production use, you should:
1. Implement Firebase Authentication for user-based data sharing
2. Set up Firestore Security Rules to restrict access
3. Use HTTPS only (automatic with Firebase)
4. Consider implementing user accounts for true multi-device sync

## Current Limitations

- Each device maintains its own data document in Firebase
- For shared data across devices, devices would need to use the same document ID (not recommended)
- Consider adding user authentication for proper multi-user, multi-device sync

## Troubleshooting

- If sync fails, check browser console for Firebase errors
- Ensure Firestore is enabled in Firebase Console
- Check Firebase configuration in `src/services/firebase.ts`
- Verify internet connection for Firebase sync

